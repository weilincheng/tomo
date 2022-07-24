const MAX_ITERATIONS = 15;

const getRandomPoints = (dataset, k) => {
  const randomIndexes = [];
  while (randomIndexes.length < k) {
    const centroidIndex = Math.floor(Math.random() * dataset.length);
    if (randomIndexes.includes(centroidIndex)) {
      continue;
    }
    randomIndexes.push(centroidIndex);
  }
  return randomIndexes.map((index) => {
    return dataset[index];
  });
};

const getNaiveSharding = (dataset, k) => {
  const pointCount = dataset.length;
  const groupCount = Math.floor(pointCount / k);
  const clusters = [];
  for (let i = 0; i < k; i++) {
    const startIndex = i * groupCount;
    const endIndex = i != k - 1 ? startIndex + groupCount : pointCount;
    const cluster = [];
    for (let j = startIndex; j < endIndex; j++) {
      cluster.push(j);
    }
    clusters.push(cluster);
  }
  return clusters;
};

const getEuclideanDistance = (pointA, pointB) => {
  let distance = 0;
  for (let i = 0; i < pointA.length; i++) {
    distance += Math.pow(pointA[i] - pointB[i], 2);
  }
  return Math.sqrt(distance);
};

const assignPointsToCentroids = (dataset, centroids) => {
  const clusters = centroids.map(() => {
    return [];
  });
  for (let i = 0; i < dataset.length; i++) {
    let minDistance = Infinity;
    let minDistanceIndex = 0;
    for (let j = 0; j < centroids.length; j++) {
      const distance = getEuclideanDistance(dataset[i], centroids[j]);
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = j;
      }
    }
    clusters[minDistanceIndex].push(i);
  }
  return clusters;
};

const getMeanPoints = (dataset, cluster) => {
  const sum = cluster.reduce(
    (prev, cur) => {
      return prev.map((point, index) => {
        return point + dataset[cur][index];
      });
    },
    [0, 0]
  );
  return sum.map((value) => {
    return value / cluster.length;
  });
};

const getClusterCentroids = (dataset, clusters) => {
  const centroids = [];
  for (const cluster of clusters) {
    if (cluster.length === 0) {
      centroids.push(getRandomPoints(dataset, 1)[0]);
    } else {
      centroids.push(getMeanPoints(dataset, cluster));
    }
  }
  return centroids;
};

const compareTwoPoints = (pointsA, pointsB) => {
  if (pointsA[0] !== pointsB[0] || pointsA[1] !== pointsB[1]) {
    return false;
  }
  return true;
};

const compareCentroids = (prevCentroids, centroids) => {
  if (!prevCentroids) {
    return false;
  }
  for (const [index, centroid] of centroids.entries()) {
    if (!compareTwoPoints(centroid, prevCentroids[index])) {
      return false;
    }
  }
  return true;
};

const kmeans = (dataset, k) => {
  if (dataset.length <= k) {
    return dataset;
  }
  let iterations = 0;
  let prevCentroids, centroids, clusters;
  clusters = getNaiveSharding(dataset, k);
  centroids = getClusterCentroids(dataset, clusters);
  while (
    iterations < MAX_ITERATIONS &&
    !compareCentroids(prevCentroids, centroids)
  ) {
    clusters = assignPointsToCentroids(dataset, centroids);
    prevCentroids = centroids;
    centroids = getClusterCentroids(dataset, clusters);
    if (compareCentroids(prevCentroids, centroids)) {
      break;
    }
    iterations++;
  }
  return clusters;
};

module.exports = {
  getRandomPoints,
  getNaiveSharding,
  getEuclideanDistance,
  assignPointsToCentroids,
  getMeanPoints,
  getClusterCentroids,
  compareTwoPoints,
  compareCentroids,
  kmeans,
};
