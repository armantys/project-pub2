import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, BarChart } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

interface Prediction {
  id?: number;
  label: 'PUB' | 'NO PUB';
  confidence: number;
  image_path: string;
  timestamp?: string;
}

const Dashboard = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await fetch('http://localhost:8000/prediction');
      const data = await res.json();
      setPredictions(data);
    } catch (err) {
      console.error('Erreur de récupération des prédictions :', err);
    }
  };

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Échec de la prédiction');
      }

      const result = await response.json();

      const label = result.label.toUpperCase() === 'PUB' ? 'PUB' : 'NO PUB';

      const newPrediction: Prediction = {
        label,
        confidence: result.confidence,
        image_path: `image/${result.filename}`,
        // ⚠️ Assure-toi que le user_id existe côté back ou via login/token
        // Tu peux aussi le stocker dans localStorage ou le récupérer dynamiquement
        // Ici en dur : user_id = 1
      };

      const saveRes = await fetch('http://localhost:8000/save-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPrediction, user_id: 1 }),
      });

      if (!saveRes.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setPrediction(newPrediction);
      await fetchPredictions();
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur lors de la prédiction :', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Analysez une image pour détecter la publicité</p>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <BarChart className="w-5 h-5 mr-2 text-teal-600" />
            Analyse d’image
          </h2>

          <ImageUploader onImageSelect={handleImageSelect} />

          {isLoading && (
            <div className="mt-4 flex items-center">
              <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-teal-600 rounded-full"></div>
              <span className="ml-3 text-gray-500">Analyse en cours...</span>
            </div>
          )}

          <Link
            to="/webcam"
            className="inline-flex mt-4 items-center px-4 py-2 border border-teal-600 text-teal-600 rounded hover:bg-teal-50"
          >
            <Camera className="w-4 h-4 mr-2" />
            Utiliser la webcam
          </Link>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Historique des prédictions</h2>

          <div className="space-y-4">
            {predictions.length === 0 ? (
              <p className="text-gray-500">Aucune prédiction pour le moment.</p>
            ) : (
              predictions.slice().reverse().map((pred, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-semibold ${pred.label === 'PUB' ? 'text-red-600' : 'text-green-600'}`}>
                      {pred.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(pred.timestamp || '').toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">Confiance : {pred.confidence}%</p>
                  <img
                    src={`http://localhost:8000/${pred.image_path}`}
                    alt={`prediction-${index}`}
                    className="mt-2 rounded w-full object-cover max-h-48"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
