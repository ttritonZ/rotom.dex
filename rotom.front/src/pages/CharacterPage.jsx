import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CharacterCard from '../components/CharacterCard';

export default function CharacterPage() {
  const [characters, setCharacters] = useState([]);
  const [regions, setRegions] = useState([]);
  const [types, setTypes] = useState([]);
  const [trainerClasses, setTrainerClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/characters').then(res => setCharacters(res.data));
    axios.get('http://localhost:5000/api/regions').then(res => setRegions(res.data));
    axios.get('http://localhost:5000/api/types').then(res => setTypes(res.data));
    axios.get('http://localhost:5000/api/characters/trainer-classes').then(res => setTrainerClasses(res.data));
  }, []);

  const filteredCharacters = characters.filter(c =>
    c.character_name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedRegions.length === 0 || selectedRegions.includes(c.character_region)) &&
    (selectedTypes.length === 0 || selectedTypes.includes(c.preferred_type)) &&
    (selectedClasses.length === 0 || c.trainer_class.some(cls => selectedClasses.includes(cls)))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Characters</h1>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-60"
        />

        <div>
          <h3 className="font-semibold">Region:</h3>
          {regions.map(r => (
            <label key={r.region_id} className="block">
              <input
                type="checkbox"
                value={r.region_id}
                checked={selectedRegions.includes(r.region_id)}
                onChange={() =>
                  setSelectedRegions(prev => prev.includes(r.region_id)
                    ? prev.filter(id => id !== r.region_id)
                    : [...prev, r.region_id]
                  )
                }
              /> {r.region_name}
            </label>
          ))}
        </div>

        <div>
          <h3 className="font-semibold">Preferred Type:</h3>
          {types.map(t => (
            <label key={t.type_id} className="block">
              <input
                type="checkbox"
                value={t.type_id}
                checked={selectedTypes.includes(t.type_id)}
                onChange={() =>
                  setSelectedTypes(prev => prev.includes(t.type_id)
                    ? prev.filter(id => id !== t.type_id)
                    : [...prev, t.type_id]
                  )
                }
              /> {t.type_name}
            </label>
          ))}
        </div>

        <div>
          <h3 className="font-semibold">Trainer Class:</h3>
          {trainerClasses.map(cls => (
            <label key={cls} className="block">
              <input
                type="checkbox"
                value={cls}
                checked={selectedClasses.includes(cls)}
                onChange={() =>
                  setSelectedClasses(prev => prev.includes(cls)
                    ? prev.filter(c => c !== cls)
                    : [...prev, cls]
                  )
                }
              /> {cls}
            </label>
          ))}
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCharacters.map(character => (
          <CharacterCard key={character.character_id} character={character} />
        ))}
      </div>
    </div>
  );
}
