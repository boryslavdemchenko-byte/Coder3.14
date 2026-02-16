
import Head from 'next/head';
import Layout from '../components/Layout';
import MoviePreferenceQuiz from '../components/quiz/MoviePreferenceQuiz';

export default function QuizPage() {
  return (
    <Layout title="Movie Preference Quiz - Flico">
      <Head>
        <title>Movie Preference Quiz | Flico</title>
        <meta name="description" content="Discover your movie archetype and get personalized recommendations with our premium movie preference quiz." />
      </Head>
      <MoviePreferenceQuiz />
    </Layout>
  );
}
