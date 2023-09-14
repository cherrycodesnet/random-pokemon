import React, { useState, useEffect } from 'react';
import './App.css';
import getRandomPokemon from './getRandomPokemon';
import getHeldItem from './getHeldItem';
import samplePokemon from './sample-pokemon.json';
import { Pokemon } from './types';

const wikiLink = (url: string) => `https://bulbapedia.bulbagarden.net/wiki/${url}`;

const HeldItemsList = ({ list }) => {
  if (list.length === 0) {
    return;
  }

  const myList = list.map((item, index) => {
    const wikiName = item.name.replace(/-(.)/g, function (match, capturedCharacter) {
      const upperCaseCharacter = capturedCharacter.toUpperCase();
      return `_${upperCaseCharacter}`;
    });

    return (
      <a key={index} href={`https://bulbapedia.bulbagarden.net/wiki/${wikiName}`} target="_blank" rel="noreferrer">
        <img src={item.sprite} alt={`${item.name} sprite`} />
        {item.name}
      </a>
    );
  });

  return (
    <div>
      <h3>Held items</h3>
      {myList}
    </div>
  );
};

const TypeList = ({ list }) => {
  const myList = list.map((item, index) => {
    const linkHref = `${wikiLink(item.type.name)}_(type)`;

    return (
      <a href={linkHref} target="_blank" key={index} className={item.type.name} rel="noreferrer">
        {item.type.name}
      </a>
    );
  });

  return <div>{myList}</div>;
};

const BaseStatList = ({ list }) => {
  const myList = list.map((item, index) => {
    return (
      <div key={index}>
        <span>{item.stat.name}:</span>
        <span>{item.base_stat}</span>
      </div>
    );
  });

  return (
    <div>
      <h3>Base stats</h3>
      {myList}
    </div>
  );
};

const WeightList = ({ hectograms }) => {
  const kg = hectograms / 10;
  const lbs = (hectograms * 0.22046226).toFixed(1);

  return (
    <div>
      Weight: {kg} kg ({lbs} lbs)
    </div>
  );
};

const HeightList = ({ decimeters }) => {
  const cm = decimeters * 10;
  const inches = Math.ceil(decimeters * 3.93700787);

  return (
    <div>
      Height: {cm} cm ({inches} inches)
    </div>
  );
};

export default function App() {
  // const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon | null>(samplePokemon);
  const [heldItems, setHeldItems] = useState<{ name: string; sprite: string }[]>([]);

  const fetchNewRandomPokemon = async () => {
    try {
      const newPokemon = await getRandomPokemon();
      console.log(newPokemon);
      setPokemon(newPokemon);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (pokemon) {
      const newHeldItemsPromises = pokemon.held_items.map(async (item) => {
        const itemInfo = await getHeldItem(item.item.url);
        return itemInfo;
      });

      Promise.all(newHeldItemsPromises)
        .then((resolvedHeldItems) => {
          console.log(resolvedHeldItems);
          setHeldItems(resolvedHeldItems);
        })
        .catch((error) => {
          console.error('Error fetching held items:', error);
        });
    }
  }, [pokemon]);

  return (
    <div>
      <button onClick={fetchNewRandomPokemon}>Click me</button>
      {pokemon ? (
        <div>
          <HeldItemsList list={heldItems} />
          <TypeList list={pokemon.types} />
          <BaseStatList list={pokemon.stats} />
          <h2 className="pokemon-name">{pokemon.name}</h2>
          <div className="pokemon-id">#{pokemon.id}</div>
          <WeightList hectograms={pokemon.weight} />
          <HeightList decimeters={pokemon.height} />
          <div className="pokemon-sprites">
            <img src={pokemon.sprites.other['official-artwork']['front_default']} alt="" />
            <img src={pokemon.sprites.other['official-artwork']['front_shiny']} alt="" />
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
