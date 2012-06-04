"use strict";

// -- Vector3 -- {{{

var Vector3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Vector3.prototype = {
    neg: function() {
        return new Vector3(
            -this.x,
            -this.y,
            -this.z);
    },

    add: function(v) {
        return new Vector3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z);
    },

    sub: function(v) {
        return new Vector3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z);
    },

    mul: function(s) {
        return new Vector3(
            s * this.x,
            s * this.y,
            s * this.z);
    },

    dot: function(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    },

    cross: function(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x);
    },

    norm: function() {
        return Math.sqrt(this.dot(this));
    },

    unit: function() {
        return this.mul(1 / this.norm());
    }
};

// }}}

// -- Matrix44 -- {{{

var Matrix44 = function(values) {
    this.values = values;
};

Matrix44.translation = function(v) {
    return new Matrix44([
        [ 1, 0, 0, v.x ],
        [ 0, 1, 0, v.y ],
        [ 0, 0, 1, v.z ],
        [ 0, 0, 0,   1 ]
    ]);
};

Matrix44.rotationX = function(a) {
    return new Matrix44([
        [ 1,            0,           0, 0 ],
        [ 0,  Math.cos(a), Math.sin(a), 0 ],
        [ 0, -Math.sin(a), Math.cos(a), 0 ],
        [ 0,            0,           0, 1 ]
    ]);
};

Matrix44.rotationY = function(a) {
    return new Matrix44([
        [ Math.cos(a), 0, -Math.sin(a), 0 ],
        [ 0,           1,            0, 0 ],
        [ Math.sin(a), 0,  Math.cos(a), 0 ],
        [ 0,           0,            0, 1 ]
    ]);
};

Matrix44.rotationZ = function(a) {
    return new Matrix44([
        [  Math.cos(a), Math.sin(a), 0, 0 ],
        [ -Math.sin(a), Math.cos(a), 0, 0 ],
        [            0,           0, 1, 0 ],
        [            0,           0, 0, 1 ]
    ]);
};

Matrix44.rotation = function(v, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    var x = v.x;
    var y = v.y;
    var z = v.z;

    return new Matrix44([
        [ 1 + (1 - c) * (x * x - 1),  -z * s + (1 - c) * x * y,   y * s + (1 - c) * x * z, 0 ],
        [   z * s + (1 - c) * x * y, 1 + (1 - c) * (y * y - 1),  -x * s + (1 - c) * y * z, 0 ],
        [  -y * s + (1 - c) * x * z,   x * s + (1 - c) * y * z, 1 + (1 - c) * (z * z - 1), 0 ],
        [                         0,                         0,                         0, 1 ]
    ]);
};

Matrix44.prototype = {
    mul: function(m) {
        var vals = new Array(4);
        for (var i = 0; i < 4; i++) {
            vals[i] = new Array(4);
            for (var j = 0; j < 4; j++) {
                vals[i][j] = 0;
                for (var k = 0; k < 4; k++) {
                    vals[i][j] += this.values[i][k] * m.values[k][j];
                }
            }
        }

        return new Matrix44(vals);
    },

    vmul: function(v) {
        return new Vector3(
            this.values[0][0] * v.x + this.values[0][1] * v.y + this.values[0][2] * v.z + this.values[0][3],
            this.values[1][0] * v.x + this.values[1][1] * v.y + this.values[1][2] * v.z + this.values[1][3],
            this.values[2][0] * v.x + this.values[2][1] * v.y + this.values[2][2] * v.z + this.values[2][3]);
    }
};

// }}}

// -- Plane -- {{{

var Plane = function(p, n) {
    this.p = p;
    this.n = n;
};

Plane.fromVertices = function(v1, v2, v3) {
    return new Plane(
        v1.add(v2).add(v3).mul(1 / 3),
        v2.sub(v1).cross(v3.sub(v1)).unit());
};

// }}}

// -- Face -- {{{

var Face = function(vertices, color) {
    this.vertices = vertices;
    this.color = color;
};

Face.prototype = {
    setVertices: function(vertices) {
        return new Face(vertices, this.color);
    },

    setColor: function(color) {
        return new Face(this.vertices, color);
    },

    centroid: function() {
        var sum = new Vector3(0, 0, 0);
        this.vertices.forEach(function(v) {
            sum = sum.add(v);
        });

        return sum.mul(1 / this.vertices.length);
    },

    transform: function(matrix) {
        return this.setVertices(
            this.vertices.map(function(v) {
                return matrix.vmul(v);
            }));
    },

    shorten: function(length) {
        var centroid = this.centroid();
        return this.setVertices(
            this.vertices.map(function(v) {
                return v.sub(v.sub(centroid).unit().mul(length));
            }));
    },

    soften: function(length) {
        var vertices = [];
        for (var i = 0; i < this.vertices.length; i++) {
            var v1 = this.vertices[i];
            var v2 = this.vertices[(i + 1) % this.vertices.length];

            if (v2.sub(v1).norm() > 2 * length) {
                vertices.push(v1.add(v2.sub(v1).unit().mul(length)));
                vertices.push(v2.add(v1.sub(v2).unit().mul(length)));
            } else {
                vertices.push(v1.add(v2).mul(0.5));
            }
        }

        return this.setVertices(vertices);
    },

    clip: function(plane) {
        var EPSILON = 0.01;
        var INSIDE = 0;
        var FRONT = 1;
        var BACK = 2;

        var position = new Array(this.vertices.length);
        var allFront = true;
        var allBack = true;
        for (var i = 0; i < this.vertices.length; i++) {
            var d = this.vertices[i].sub(plane.p).dot(plane.n);

            if (d > EPSILON) {
                position[i] = FRONT;
                allBack = false;
            } else if (d < -EPSILON) {
                position[i] = BACK;
                allFront = false;
            } else {
                position[i] = INSIDE;
            }
        }

        if (allBack) {
            return this.setVertices([]);
        }

        if (allFront) {
            return this;
        }

        var vertices = [];
        for (var j = 0; j < this.vertices.length; j++) {
            var v1 = this.vertices[j];
            var v2 = this.vertices[(j + 1) % this.vertices.length];
            var p1 = position[j];
            var p2 = position[(j + 1) % this.vertices.length];

            if (p1 !== BACK) {
                vertices.push(v1);
            }

            if ((p1 === FRONT && p2 === BACK) || (p1 === BACK && p2 === FRONT)) {
                var t = -(plane.n.dot(v1) + plane.n.neg().dot(plane.p)) / v2.sub(v1).dot(plane.n);
                vertices.push(v1.add(v2.sub(v1).mul(t)));
            }
        }

        return this.setVertices(vertices);
    }
};

// }}}

// -- Mesh -- {{{

var Mesh = function(faces) {
    this.faces = faces;
};

Mesh.prototype = {
    transform: function(matrix) {
        return new Mesh(
            this.faces.map(function(f) {
                return f.transform(matrix);
            }));
    },

    rotateHalfspace: function(plane, angle) {
        var matrix = Matrix44.rotation(plane.n, angle);
        return new Mesh(
            this.faces.map(function(f) {
                return f.centroid().sub(plane.p).dot(plane.n) >= 0 ?
                    f.transform(matrix) :
                    f;
            }));
    },

    shortenFaces: function(length) {
        return new Mesh(
            this.faces.map(function(f) {
                return f.shorten(length);
            }));
    },

    softenFaces: function(length) {
        return new Mesh(
            this.faces.map(function(f) {
                return f.soften(length);
            }));
    },

    clip: function(plane) {
        return new Mesh(
            this.faces
                .map(function(f) {
                    return f.clip(plane);
                })
                .filter(function(f) {
                    return f.vertices.length > 0;
                }));
    },

    cut: function(plane, width) {
        var front = this.clip(new Plane(plane.p.add(plane.n.mul(width / 2)), plane.n));
        var back = this.clip(new Plane(plane.p.sub(plane.n.mul(width / 2)), plane.n.neg()));

        return front.union(back);
    },

    union: function(mesh) {
        return new Mesh(this.faces.concat(mesh.faces));
    }
};

Mesh.cube = function(colors) {
    var a = 0.5;

    var vertices = [
        new Vector3(-a, -a, -a),
        new Vector3(-a, -a,  a),
        new Vector3(-a,  a, -a),
        new Vector3(-a,  a,  a),
        new Vector3( a, -a, -a),
        new Vector3( a, -a,  a),
        new Vector3( a,  a, -a),
        new Vector3( a,  a,  a)
    ];

    var faces = [
        new Face([vertices[0], vertices[1], vertices[3], vertices[2]], colors[0]),
        new Face([vertices[1], vertices[5], vertices[7], vertices[3]], colors[1]),
        new Face([vertices[0], vertices[4], vertices[5], vertices[1]], colors[2]),
        new Face([vertices[4], vertices[6], vertices[7], vertices[5]], colors[3]),
        new Face([vertices[0], vertices[2], vertices[6], vertices[4]], colors[4]),
        new Face([vertices[2], vertices[3], vertices[7], vertices[6]], colors[5])
    ];

    return new Mesh(faces);
};

// }}}

// -- Panel3D -- {{{

var Panel3D = function() {
    this.lightDirection = new Vector3(0, 0.25, -1).unit();
    this.viewerPosition = new Vector3(0, 0, -325);
    this.cameraPosition = new Vector3(0, 0, -2.8);
    this.cameraRotation = new Vector3(0, 0, 0);
};

Panel3D.prototype = (function() {
    var toCameraCoordinates = function(cameraPosition, cameraRotation, v) {
        return Matrix44.rotationX(cameraRotation.x).vmul(
               Matrix44.rotationY(cameraRotation.y).vmul(
               Matrix44.rotationZ(cameraRotation.z).vmul(
               v.sub(cameraPosition))));
    };
    
    var perspectiveProjection = function(width, height, viewerPosition, v) {
        return new Vector3(
            (width / 2) + (-v.x - viewerPosition.x) * (viewerPosition.z / v.z),
            (height / 2) + (v.y - viewerPosition.y) * (viewerPosition.z / v.z),
            0);
    };

    var renderFace = function(paper, vertices, color) {
        var path = "";
        
        path += "M" + vertices[0].x + "," + vertices[0].y;
        vertices.slice(1).forEach(function(v) {
            path += "L" + v.x + "," + v.y;
        });
        path += "z";

        paper.path(path).attr({ fill: color, stroke: "none" });
    };

    return {
        render: function(paper, mesh) {
            // painter's algorithm
            var faces = mesh.faces.slice();
            faces.sort(function(f1, f2) {
                return f2.centroid().z - f1.centroid().z;
            });
    
            // projection
            var self = this;
            var pFaces = faces.map(function(face) {
                return face.setVertices(
                    face.vertices.map(function(v) {
                        return perspectiveProjection(
                            paper.width,
                            paper.height,
                            self.viewerPosition,
                            toCameraCoordinates(
                                self.cameraPosition,
                                self.cameraRotation,
                                v));
                    }));
            });
    
            // rendering
            pFaces.forEach(function(face) {
                var plane =
                    Plane.fromVertices(
                        face.vertices[0],
                        face.vertices[1],
                        face.vertices[2]);
    
                var color =
                    plane.n.z >= 0 ?
                        face.color : // front facing
                        "#DDDDDD";   // back facing

                renderFace(paper, face.vertices, color);
            });
        }
    };
})();

// }}}

