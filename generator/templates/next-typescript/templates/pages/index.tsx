import type { NextPage } from 'next';
import Head from 'next/head';

interface HomeProps {
  name: string;
  description: string;
}

const Home: NextPage<HomeProps> = ({ name, description }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{name}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to {name}</h1>
        <p className="text-lg text-gray-700 mb-4">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add your components here */}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home; 