import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
var slugify = require('slugify')

import { fetchData, fetchAllDataParallel } from "../../lib/swapiApi";

const inter = Inter({ subsets: ['latin'] })

const Character = ({ character }) => {
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
          <p>Name: {character.name}</p>
          <p>Species: {character.species}</p>
          <p>Movies: {character.films}</p>
          <p>Spaceships:</p>
        </div>
      </main>
    </>
  )
}

export async function getStaticPaths() {

    const peopleRes = await Promise.all([
        fetchAllDataParallel("/people"),
    ]);
  
    return {
      paths: peopleRes[0].map((character) => ({
        params: {
          id: character.id
        },
      })),
      fallback: false,
    };
  }

export async function getStaticProps({params}) {

    const characterRes = await Promise.all([
      fetchData("/people/"+params.id),
    ]);

    return {
        props: {
          character: characterRes[0]
        },
        revalidate: 10000,
    };
}

export default Character;