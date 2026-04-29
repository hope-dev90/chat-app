import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <>{children}</>,
  Routes: ({ children }) => <>{children}</>,
  Route: ({ element }) => element,
  Navigate: () => null,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null })
}), { virtual: true });

test('renders the login screen', () => {
  render(<App />);
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});
