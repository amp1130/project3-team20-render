import pool from '@/db';

export async function getMenuItems() {
  try {
    const result = await pool.query('SELECT * FROM menuitems');
    return result.rows;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
} 

// function to get sales by item for a specific date
export async function query({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}