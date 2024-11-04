import { render, screen } from '@testing-library/react';
import App from './App';


test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders Test Results heading', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /test results/i });
  expect(headingElement).toBeInTheDocument();
});
