const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('../app');

chai.use(chaiHttp);

const testImage = "iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAABHNCSVQICAgIfAhkiAAAAGZJREFUSInt1sEKACEIBNCZZX/cDzf3FHRVwWrRuzxCjaGZGQrrqcQabPDnIEmQrANXuBT0flR3zDAyuxQ4a4xRC27Z0gYbPA8UkRRIb2pbby8S+NwvnIiqujEAeCNNmSh7/tJcB36uzxur+4fO1QAAAABJRU5ErkJggg==";

describe('/POST preidct', () => {
    it('should return probablities', (done) => {
        chai.request(app)
            .post('/predict')
            .send({image: testImage})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('result');
                console.log(`test: result = ${JSON.stringify(res.body, null,2)}`)
                done();
            });
    });
});
