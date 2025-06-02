import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
test('renders home page', () => {
  render(<App />);
  const headerElement = screen.getByText(/AI-Enhanced Water Quality Monitoring System/i);
  expect(headerElement).toBeInTheDocument();
});
test('renders sensor dashboard link', () => {
  render(<App />);
  const linkElement = screen.getByText(/View Sensor Dashboard/i);
  expect(linkElement).toBeInTheDocument();
});