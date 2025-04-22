import React, { useEffect, useState } from 'react';
import DataTable from './DataTable';

const PostsList = () => {
  const [data, setData] = useState({ headers: [], rows: [] });

  useEffect(() => {
    fetch('http://localhost:5000/api/search/posts')
      .then(res => res.json())
      .then(data => setData(data.table))
      .catch(err => console.error(err));
  }, []);

  return <DataTable title="Posts" headers={data.headers} rows={data.rows} />;
};

export default PostsList;
