const { expect, should } = require("./setup");
const K_MEANS = require("../utilities/k_means");
describe("k-means", function () {
  describe("Get random points", function () {
    describe("When input 1 points and k = 1", function () {
      it("should return 1 point", function () {
        const points = K_MEANS.getRandomPoints([[1, 0]], 1);
        should.exist(points);
        points.should.have.lengthOf(1);
        points.should.eql([[1, 0]]);
      });
    });
    describe("When input 2 points and k = 1", function () {
      it("should return 1 point", function () {
        const points = K_MEANS.getRandomPoints(
          [
            [1, 0],
            [2, 1],
          ],
          1
        );
        should.exist(points);
        points.should.have.lengthOf(1);
      });
    });
  });
  describe("Get naive sharding", function () {
    describe("When input 16 points and k = 15", function () {
      it("should returns 3 clusters", function () {
        const clusters = K_MEANS.getNaiveSharding(
          [
            [24.9409, 121.2155],
            [24.9341, 121.2145],
            [24.9353, 121.1962],
            [24.9413, 121.2116],
            [24.9419, 121.2179],
            [24.9365, 121.2065],
            [24.9337, 121.2075],
            [24.9383, 121.1993],
            [24.9345, 121.1926],
            [24.941, 121.2165],
            [24.9407, 121.219],
            [24.9321, 121.2196],
            [24.9384, 121.2199],
            [24.9337, 121.1984],
            [24.9406, 121.2207],
            [24.9416, 121.1937],
          ],
          15
        );
        should.exist(clusters);
        clusters.should.have.lengthOf(15);
        clusters.should.eql([
          [0],
          [1],
          [2],
          [3],
          [4],
          [5],
          [6],
          [7],
          [8],
          [9],
          [10],
          [11],
          [12],
          [13],
          [14, 15],
        ]);
      });
    });
    describe("When input four points and k = 3", function () {
      it("should returns 3 clusters", function () {
        const clusters = K_MEANS.getNaiveSharding(
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
          ],
          3
        );
        should.exist(clusters);
        clusters.should.have.lengthOf(3);
        clusters.should.eql([[0], [1], [2, 3]]);
      });
    });
    describe("When input three points and k = 3", function () {
      it("should returns 3 clusters", function () {
        const clusters = K_MEANS.getNaiveSharding(
          [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
          3
        );
        should.exist(clusters);
        clusters.should.have.lengthOf(3);
        clusters.should.eql([[0], [1], [2]]);
      });
    });
    describe("When input three points and k = 2", function () {
      it("should returns 2 clusters", function () {
        const clusters = K_MEANS.getNaiveSharding(
          [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
          2
        );
        should.exist(clusters);
        clusters.should.have.lengthOf(2);
        clusters.should.eql([[0], [1, 2]]);
      });
    });
  });

  describe("Get euclidean distance", function () {
    it("should returns 0", function () {
      const distance = K_MEANS.getEuclideanDistance([1, 1], [1, 1]);
      should.exist(distance);
      distance.should.equal(0);
    });
    it("should returns Math.sqrt(2)", function () {
      const distance = K_MEANS.getEuclideanDistance([1, 1], [2, 2]);
      should.exist(distance);
      distance.should.equal(Math.sqrt(2));
    });
  });

  describe("Assign points to clusters", function () {
    describe("When input 16 points and k = 15", function () {
      it("should returns 15 clusters", function () {
        const clusters = K_MEANS.assignPointsToCentroids(
          [
            [24.9409, 121.2155],
            [24.9341, 121.2145],
            [24.9353, 121.1962],
            [24.9413, 121.2116],
            [24.9419, 121.2179],
            [24.9365, 121.2065],
            [24.9337, 121.2075],
            [24.9383, 121.1993],
            [24.9345, 121.1926],
            [24.941, 121.2165],
            [24.9407, 121.219],
            [24.9321, 121.2196],
            [24.9384, 121.2199],
            [24.9337, 121.1984],
            [24.9406, 121.2207],
            [24.9416, 121.1937],
          ],
          [
            [24.9409, 121.2155],
            [24.9341, 121.2145],
            [24.9353, 121.1962],
            [24.9413, 121.2116],
            [24.9419, 121.2179],
            [24.9365, 121.2065],
            [24.9337, 121.2075],
            [24.9383, 121.1993],
            [24.9345, 121.1926],
            [24.941, 121.2165],
            [24.9407, 121.219],
            [24.9321, 121.2196],
            [24.9384, 121.2199],
            [24.9337, 121.1984],
            [24.9411, 121.2072],
          ]
        );
        should.exist(clusters);
        clusters.should.have.lengthOf(15);
        clusters.should.eql([
          [0],
          [1],
          [2],
          [3],
          [4],
          [5],
          [6],
          [7, 15],
          [8],
          [9],
          [10, 14],
          [11],
          [12],
          [13],
          [],
        ]);
      });
    });
    it("should returns 2 clusters", function () {
      const clusters = K_MEANS.assignPointsToCentroids(
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
        [
          [1, 1],
          [2, 2],
        ]
      );
      should.exist(clusters);
      clusters.should.have.lengthOf(2);
      clusters.should.eql([[0], [1, 2]]);
    });
    it("should returns 3 clusters", function () {
      const clusters = K_MEANS.assignPointsToCentroids(
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 5],
        ],
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ]
      );
      should.exist(clusters);
      clusters.should.have.lengthOf(3);
      clusters.should.eql([[0], [1], [2, 3, 4]]);
    });
  });

  describe("Get mean points of a cluster", function () {
    it("should returns [1.5, 1]", function () {
      const mean = K_MEANS.getMeanPoints(
        [
          [1, 0],
          [2, 2],
        ],
        [0, 1]
      );
      should.exist(mean);
      mean.should.eql([1.5, 1]);
    });
  });

  describe("Get cluster centroids", function () {
    describe("When input 15 clusters", function () {
      it("should returns 15 centroids", function () {
        const centroids = K_MEANS.getClusterCentroids(
          [
            [24.9409, 121.2155],
            [24.9341, 121.2145],
            [24.9353, 121.1962],
            [24.9413, 121.2116],
            [24.9419, 121.2179],
            [24.9365, 121.2065],
            [24.9337, 121.2075],
            [24.9383, 121.1993],
            [24.9345, 121.1926],
            [24.941, 121.2165],
            [24.9407, 121.219],
            [24.9321, 121.2196],
            [24.9384, 121.2199],
            [24.9337, 121.1984],
            [24.9406, 121.2207],
            [24.9416, 121.1937],
          ],
          [
            [0],
            [1],
            [2],
            [3],
            [4],
            [5],
            [6],
            [7],
            [8],
            [9],
            [10],
            [11],
            [12],
            [13],
            [14, 15],
          ]
        );
        should.exist(centroids);
        centroids.should.have.lengthOf(15);
        centroids.should.eql([
          [24.9409, 121.2155],
          [24.9341, 121.2145],
          [24.9353, 121.1962],
          [24.9413, 121.2116],
          [24.9419, 121.2179],
          [24.9365, 121.2065],
          [24.9337, 121.2075],
          [24.9383, 121.1993],
          [24.9345, 121.1926],
          [24.941, 121.2165],
          [24.9407, 121.219],
          [24.9321, 121.2196],
          [24.9384, 121.2199],
          [24.9337, 121.1984],
          [24.9411, 121.2072],
        ]);
      });
    });
    describe("When one of cluster is empty", function () {
      it("should returns 3 centroids", function () {
        const centroids = K_MEANS.getClusterCentroids(
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
          ],
          [[0], [1, 2, 3], []]
        );
        should.exist(centroids);
        centroids.should.have.lengthOf(3);
      });
    });
    it("should returns 2 centroids", function () {
      const centroids = K_MEANS.getClusterCentroids(
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
        [[0], [1, 2]]
      );
      should.exist(centroids);
      centroids.should.have.lengthOf(2);
      centroids.should.eql([
        [1, 1],
        [2.5, 2.5],
      ]);
    });
  });

  describe("Compare two points", function () {
    it("should returns true", function () {
      const result = K_MEANS.compareTwoPoints([1, 1], [1, 1]);
      should.exist(result);
      result.should.equal(true);
    });
    it("should returns false", function () {
      const result = K_MEANS.compareTwoPoints([1, 1], [1, 2]);
      should.exist(result);
      result.should.equal(false);
    });
    it("should returns false", function () {
      const result = K_MEANS.compareTwoPoints([2, 1], [1, 1]);
      should.exist(result);
      result.should.equal(false);
    });
  });

  describe("Compare centroids", function () {
    describe("Same centroids", function () {
      it("should returns true", function () {
        const result = K_MEANS.compareCentroids(
          [
            [1, 1],
            [2, 2],
          ],
          [
            [1, 1],
            [2, 2],
          ]
        );
        should.exist(result);
        result.should.equal(true);
      });
    });
    describe("Different centroids", function () {
      it("should returns false", function () {
        const result = K_MEANS.compareCentroids(
          [
            [1, 1],
            [2, 2],
          ],
          [
            [1, 1],
            [2, 1],
          ]
        );
        should.exist(result);
        result.should.equal(false);
      });
    });
    describe("First centroid is empty", function () {
      it("should returns false", function () {
        const result = K_MEANS.compareCentroids(
          [
            [1, 1],
            [2, 2],
          ],
          [
            [1, 1],
            [2, 1],
          ]
        );
        should.exist(result);
        result.should.equal(false);
      });
    });
  });

  describe("Get clusters", function () {
    it("should returns two group of clusters", function () {
      const clusters = K_MEANS.kmeans(
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 5],
        ],
        2
      );
      should.exist(clusters);
      clusters.should.have.lengthOf(2);
    });
  });
});
