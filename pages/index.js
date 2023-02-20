import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.scss'
import Link from 'next/link'
import React, { useState, useEffect } from "react";

import { fetchAndCacheData } from "../lib/swapiApi";

const inter = Inter({ subsets: ['latin'] })

const Home = ({ characters, species, movies }) => {

  const [filteredCharacters, setFilteredCharacters] = useState(characters);
  const [filter, setFilter] = useState({ movie: "", species: "", birthYearMin: -1000, birthYearMax: 1000});

  const handleFilterChange = (event) => {
    const updatedFilter = { ...filter, [event.target.name]: event.target.value };
    setFilter(updatedFilter);
  };
  
  useEffect(() => {
    const filtered = characters.filter((character) => {
      return (
        (character.films.includes(filter.movie) || filter.movie === "") &&
        (character.species.includes(filter.species) || filter.species === "") &&
        (character.year >= parseInt(filter.birthYearMin) && character.year <= parseInt(filter.birthYearMax))
      );
    });

    setFilteredCharacters(filtered);
  }, [filter]);
  
  return (
    <>
      <Head>
        <title>Star Wars character list</title>
        <meta name="description" content="Filterable lookup for Star Wars characters" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="main">
        <div className="headline">
          <h1>Star Wars character list</h1>
        </div>

        <div className={styles.filters_container}>
        <form className={styles.filters}>
          <div>
            <label>Movie:</label>
            <select id="movie" name="movie" value={filter.movie} onChange={handleFilterChange}>
              <option value="">All</option>
              {movies.map((movie, index) => (
                <option value={movie.url} key={"movies-option-"+index}>{`Epsisode ${movie.episode}: ${movie.title}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Species:</label>
            <select id="species" name="species" value={filter.species} onChange={handleFilterChange}>
              <option value="">All</option>
              {species.map((specie, index) => (
                <option value={specie.url} key={"species-option-"+index}>{specie.name}</option>
              ))}
            </select>
          </div>

          <div className="range_container">
            <div className="sliders_control">
            <label>Year of birth:</label>
              <input
                type="range"
                id="fromSlider"
                name="birthYearMin"
                min="-1000"
                max="1000"
                value={filter.birthYearMin}
                onChange={handleFilterChange}
              />
              <input
                type="range"
                id="toSlider"
                name="birthYearMax"
                min="-1000"
                max="1000"
                value={filter.birthYearMax}
                onChange={handleFilterChange}
              />
              <div className={styles.labels}>
                <span className={styles.label}>1000 ABY</span>
                <span className={styles.label}>500 BBY</span>
                <span className={styles.label}>0 ABY</span>
                <span className={styles.label}>500 ABY</span>
                <span className={styles.label}>1000 BBY</span>
              </div>
            </div>
          </div>

        </form>
        </div>
        
        <ul className={styles.list}>
          {filteredCharacters.map((character, index) => (
            <li key={"character-"+index}>
              <Link href={"/characters/"+character.id} data-year={character.birth_year}>
                <p>{character.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}

export async function getStaticProps() {

  const [peopleRes, speciesRes, filmsRes] = await Promise.all([
    fetchAndCacheData("/people"),
    fetchAndCacheData("/species"),
    fetchAndCacheData("/films"),
  ]);

  return {
    props: {
      characters: peopleRes,
      species: speciesRes,
      movies: filmsRes
    },
    revalidate: 10000,
  };
}

export default Home;