import { render, screen } from '@testing-library/react';
import App from './App';

test('renders registration heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /campus notifications/i });
  expect(heading).toBeInTheDocument();
});
