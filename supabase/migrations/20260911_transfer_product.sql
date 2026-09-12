-- Transfer stock for a product from its current shop to another shop.
-- Uses a transaction with row locks so concurrent transfers/checkouts cannot
-- double-spend stock. Matches destination product rows on name + model_number.
-- Returns jsonb { ok, error? }.

create or replace function public.transfer_product(
  p_product_id uuid,
  p_quantity integer,
  p_to_shop_id uuid,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source public.products%rowtype;
  v_to_shop public.shops%rowtype;
  v_from_shop public.shops%rowtype;
  v_dest_product_id uuid;
begin
  if p_quantity is null or p_quantity <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Quantity must be greater than zero');
  end if;

  select * into v_source
  from public.products
  where id = p_product_id
  for update;

  if v_source.id is null then
    return jsonb_build_object('ok', false, 'error', 'Product not found');
  end if;

  select * into v_to_shop
  from public.shops
  where id = p_to_shop_id
  for update;

  if v_to_shop.id is null then
    return jsonb_build_object('ok', false, 'error', 'Destination shop not found');
  end if;

  if v_source.shop_id = p_to_shop_id then
    return jsonb_build_object('ok', false, 'error', 'Cannot transfer to the same shop');
  end if;

  if v_source.quantity < p_quantity then
    return jsonb_build_object('ok', false, 'error', 'Insufficient stock in source shop');
  end if;

  select * into v_from_shop
  from public.shops
  where id = v_source.shop_id;

  -- Reuse an existing product row in the destination shop with the same
  -- name + model_number, otherwise create a new one.
  select id into v_dest_product_id
  from public.products
  where shop_id = p_to_shop_id
    and name = v_source.name
    and coalesce(model_number, '') = coalesce(v_source.model_number, '')
  limit 1;

  if v_dest_product_id is not null then
    update public.products
    set quantity = quantity + p_quantity,
        updated_at = now()
    where id = v_dest_product_id;
  else
    insert into public.products (
      name, sku, serial_number, model_number,
      buying_price, selling_price, quantity, shop_id, created_by
    ) values (
      v_source.name, v_source.sku, v_source.serial_number, v_source.model_number,
      v_source.buying_price, v_source.selling_price, p_quantity, p_to_shop_id,
      v_source.created_by
    );
  end if;

  update public.products
  set quantity = quantity - p_quantity,
      updated_at = now()
  where id = v_source.id;

  insert into public.activity_log (
    admin_id, action_type, entity_type, entity_id, details
  ) values (
    p_admin_id, 'product_transferred', 'product', v_source.id::text,
    jsonb_build_object(
      'product_name', v_source.name,
      'model_number', v_source.model_number,
      'quantity', p_quantity,
      'from_shop_id', v_source.shop_id,
      'from_shop_name', coalesce(v_from_shop.name, ''),
      'to_shop_id', v_to_shop.id,
      'to_shop_name', v_to_shop.name
    )
  );

  return jsonb_build_object('ok', true);
end;
$$;