// src/App.test.jsx


import { render, screen } from '@testing-library/react';
import App from './App';

test("l'application se rend correctement", () => {
  render(<App />);
  expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
});