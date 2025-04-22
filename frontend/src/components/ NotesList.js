import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';

const NotesList = () => {
  const [data, setData] = useState({ headers: [], rows: [] });

  useEffect(() => {
    fetch('http://localhost:5000/api/search/resources')
      .then(res => res.json())
      .then(data => setData(data.table))
      .catch(err => console.error(err));
  }, []);

  return <DataTable title="Notes" headers={data.headers} rows={data.rows} />;
};

export default NotesList;
