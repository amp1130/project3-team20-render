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