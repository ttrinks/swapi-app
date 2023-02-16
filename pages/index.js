import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'

import { fetchAllDataParallel } from "../lib/swapiApi";

const inter = Inter({ subsets: ['latin'] })

const Home = ({ characters}) => {
  return (
    <>
      <Head>
        <title>Star Wars character lookup</title>
        <meta name="description" content="Filterable lookup for Star Wars characters" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <h1>Star Wars character Lookup</h1>
        </div>
        <div className={styles.list}>
          {characters && characters.map((character, index) => (
            <Link href={"/characters/"+index}>
              <p>{character.name}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {

  const [peopleRes] = await Promise.all([
    fetchAllDataParallel("/people"),
  ]);

  return {
    props: {
      characters: peopleRes
    },
    revalidate: 10000,
  };
}

export default Home;