/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: any) => {
        const first = Array.isArray(children) ? children[0] : children;
        return <>{first}</>;
      },
      Screen: ({ component: Component }: any) => (Component ? <Component /> : null),
    }),
  };
});

jest.mock('@tanstack/react-query-persist-client', () => {
  const { QueryClientProvider } = jest.requireActual('@tanstack/react-query');
  return {
    PersistQueryClientProvider: ({ client, children }: any) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  };
});

jest.mock('../src/api/client', () => ({
  api: {
    getCategories: jest.fn().mockResolvedValue([
      { id: '1', name: 'Clothes', slug: 'clothes', iconName: 'shirt' },
    ]),
    getProducts: jest.fn().mockResolvedValue([]),
    getProductById: jest.fn().mockResolvedValue(null),
    getOrders: jest.fn().mockResolvedValue([]),
    createOrder: jest.fn().mockResolvedValue({ id: 'test', orderReference: 'DG-TEST' }),
    login: jest.fn(),
    register: jest.fn(),
    getNotifications: jest.fn().mockResolvedValue({ notifications: [], total: 0, unreadCount: 0 }),
    getUnreadNotificationCount: jest.fn().mockResolvedValue(0),
    markNotificationAsRead: jest.fn().mockResolvedValue({ unreadCount: 0 }),
    markAllNotificationsAsRead: jest.fn().mockResolvedValue({ unreadCount: 0 }),
  },
  API_BASE_URL: 'http://localhost:5000/api/v1',
}));

import { queryClient } from '../src/api/queryClient';

describe('D&G E-Commerce App Component', () => {
  afterEach(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
  });

  test('renders without crashing', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<App />);
    });
    expect(tree).toBeDefined();

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  }, 30000);
});
