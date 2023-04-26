import axios from 'axios';
export default async function getPixabay(url) {
  const res = await axios.get(url);
  return res;
}
