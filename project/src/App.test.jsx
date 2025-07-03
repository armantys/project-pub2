// src/App.test.jsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('l’application se rend correctement', () => {
  render(<App />);
  // Vérifie qu’un élément présent dans ton App est bien rendu (ex: un titre ou un bouton)
  const element = screen.getByText(/Bienvenue|Accueil|Connexion|Votre texte/i);
  expect(element).toBeInTheDocument();
});