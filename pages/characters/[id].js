import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Character.module.scss'
import { fetchData, fetchAndCacheData } from "../../lib/swapiApi";

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
      <main className="main">
        <div className="headline">
          <h1>{character.name}</h1>
        </div>
        <div className={styles.details}>
          {Array.isArray(character.species) && character.species.length > 0 && (
            <><p>
              Species: {character.species.join(', ')}
            </p><br /></>
          )}
          {Array.isArray(character.films) && character.films.length > 0 && (
            <><p>
              Movies: {character.films.join(', ')}
            </p><br /></>
          )}
          {Array.isArray(character.starships) && character.starships.length > 0 && (
            <><p>
              Spaceships: {character.starships.join(', ')}
            </p><br /></>
          )}
        </div>
      </main>
    </>
  )
}

export async function getStaticPaths() {

    const peopleRes = await Promise.all([
      fetchAndCacheData("/people"),
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

  const [characterRes, starshipsRes, filmsRes, speciesRes] = await Promise.all([
    //fetchData("/people/"+params.id),
    fetchAndCacheData("/people"),
    fetchAndCacheData("/starships"),
    fetchAndCacheData("/films"),
    fetchAndCacheData("/species"),
  ]);

  // get charcter by id
  function getCharcterById(id, array) {
    return array.find(obj => obj.id === id);
  }

  let selectedCharacter = getCharcterById(params.id, characterRes)

  const replaceUrlsWithNames = (obj, linkedData, linkedFieldUrl, linkedFieldTitle) => {
      obj[linkedFieldUrl] = obj[linkedFieldUrl].map(linkedUrl => {
        const matchingLinked = linkedData.find(linked => linked.url === linkedUrl);
        return matchingLinked ? matchingLinked[linkedFieldTitle] : linkedUrl;
      });
      return obj;
  };

  selectedCharacter = replaceUrlsWithNames(
    selectedCharacter, 
    filmsRes, 
    'films', 
    'title'
  );

  selectedCharacter = replaceUrlsWithNames(
    selectedCharacter, 
    starshipsRes, 
    'starships', 
    'name'
  );

  selectedCharacter = replaceUrlsWithNames(
    selectedCharacter, 
    speciesRes, 
    'species', 
    'name'
  );

  return {
      props: {
        character: selectedCharacter,
        starships: starshipsRes,
        movies: filmsRes
      },
      revalidate: 10000,
  };
}

export default Character;