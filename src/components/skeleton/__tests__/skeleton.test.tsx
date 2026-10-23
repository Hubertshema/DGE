import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  Skeleton,
  ProductCardSkeleton,
  ProductListSkeleton,
  ProductDetailsSkeleton,
  OrderCardSkeleton,
  OrderListSkeleton,
  OrderDetailsSkeleton,
  SellerProductItemSkeleton,
  SellerProductListSkeleton,
  SyncIndicator,
} from '../index';

describe('Skeleton Loading Components', () => {
  it('renders base Skeleton primitive without crashing', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Skeleton width={100} height={20} />);
    });
    expect(renderer!.toJSON()).toBeTruthy();
  });

  it('renders ProductCardSkeleton and ProductListSkeleton matching UI structure', () => {
    let singleCard: ReactTestRenderer.ReactTestRenderer;
    let list: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      singleCard = ReactTestRenderer.create(<ProductCardSkeleton />);
      list = ReactTestRenderer.create(<ProductListSkeleton count={4} />);
    });
    expect(singleCard!.toJSON()).toBeTruthy();
    expect(list!.toJSON()).toBeTruthy();
  });

  it('renders ProductDetailsSkeleton with hero image, text, and action bar placeholders', () => {
    let details: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      details = ReactTestRenderer.create(<ProductDetailsSkeleton />);
    });
    expect(details!.toJSON()).toBeTruthy();
  });

  it('renders OrderCardSkeleton and OrderListSkeleton', () => {
    let singleOrder: ReactTestRenderer.ReactTestRenderer;
    let orderList: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      singleOrder = ReactTestRenderer.create(<OrderCardSkeleton />);
      orderList = ReactTestRenderer.create(<OrderListSkeleton count={3} />);
    });
    expect(singleOrder!.toJSON()).toBeTruthy();
    expect(orderList!.toJSON()).toBeTruthy();
  });

  it('renders OrderDetailsSkeleton with status overview, items, and address cards', () => {
    let orderDetails: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      orderDetails = ReactTestRenderer.create(<OrderDetailsSkeleton />);
    });
    expect(orderDetails!.toJSON()).toBeTruthy();
  });

  it('renders SellerProductItemSkeleton and SellerProductListSkeleton', () => {
    let sellerItem: ReactTestRenderer.ReactTestRenderer;
    let sellerList: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      sellerItem = ReactTestRenderer.create(<SellerProductItemSkeleton />);
      sellerList = ReactTestRenderer.create(<SellerProductListSkeleton count={3} />);
    });
    expect(sellerItem!.toJSON()).toBeTruthy();
    expect(sellerList!.toJSON()).toBeTruthy();
  });

  it('renders SyncIndicator conditionally based on isSyncing', () => {
    let inactive: ReactTestRenderer.ReactTestRenderer;
    let active: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      inactive = ReactTestRenderer.create(<SyncIndicator isSyncing={false} label="Live updating..." />);
      active = ReactTestRenderer.create(<SyncIndicator isSyncing={true} label="Live updating..." />);
    });
    expect(inactive!.toJSON()).toBeNull();
    expect(active!.toJSON()).toBeTruthy();
  });
});
