import { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Welcome to AI-CRM Generator
        </h1>
        <p className="text-gray-600 text-center">
          A modern web application generator that creates customized CRM solutions using AI assistance.
        </p>
      </div>
    </div>
  );
};

export default Home; 