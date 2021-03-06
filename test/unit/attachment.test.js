const fs = require('fs');
const { describe, it, before, after } = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const Taleo = require('../../');
const env = require('../env');
const md5 = require('md5');

chai.use(require('chai-url'));

describe('packet', function () {
  var taleo;

  this.timeout(30000);

  before(function (done) {
    taleo = new Taleo(env);
    taleo.connect(done);
  });

  after(function (done) {
    taleo.close(done);
  });

  it('download attachment', function (done) {
    taleo.getEmployee(614, (err, employee) => {
      expect(err).to.not.exist;
      expect(employee).to.exist;
      taleo.getAttachments(employee, (err, attachments) => {
        expect(err).to.not.exist;
        expect(attachments).to.exist;
        expect(attachments).to.be.an('array');
        expect(attachments.length).to.be.above(0);
        taleo.downloadAttachment(attachments[0], (readStream) => {
          readStream.pipe(fs.createWriteStream('./attachment1.pdf'));
        }, (err) => {
          expect(err).to.not.exist;
          fs.readFile('./attachment1.pdf', (err, data) => {
            expect(err).to.not.exist;
            expect(data).to.exist;
            expect(md5(data)).to.equal('3e017a8eebeebbdfe6237f4f29f5a9f6');
            fs.unlink('./attachment1.pdf', done);
          });
        });
      });
    });
  });

  describe('attachment properties', function () {
    var attachment;

    before(function (done) {
      taleo.getEmployee(614, (err, employee) => {
        expect(err).to.not.exist;
        taleo.getAttachments(employee, (err, attachments) => {
          expect(err).to.not.exist;
          expect(attachments).to.be.an('array');
          expect(attachments.length).to.be.above(0);
          attachment = attachments[0];
          done();
        });
      });
    });

    it('attachment ID', function (done) {
      expect(attachment.getId()).to.exist;
      expect(attachment.getId()).to.be.a('number');
      done();
    });

    it('attachment type', function (done) {
      expect(attachment.getAttachmentType()).to.exist;
      expect(attachment.getAttachmentType()).to.be.a('string');
      expect(attachment.getAttachmentType()).to.be.oneOf([
        'Offer_Type',
        'Resume_Type',
        'User_Attachment_Type',
        'Candidate_Attachment_Type'
      ]);
      done();
    });

    it('attachment entity', function (done) {
      expect(attachment.getAttachedId()).to.exist;
      expect(attachment.getAttachedId()).to.be.a('number');
      expect(attachment.getAttachedId()).to.be.equal(614);
      done();
    });

    it('attachment entity type', function (done) {
      expect(attachment.getAttachedEntityType()).to.exist;
      expect(attachment.getAttachedEntityType()).to.be.a('string');
      expect(attachment.getAttachedEntityType()).to.be.equal('employee');
      done();
    });

    it('attachment download URL', function (done) {
      expect(attachment.getDownloadUrl()).to.exist;
      expect(attachment.getDownloadUrl()).to.be.a('string');
      expect(attachment.getDownloadUrl()).to.be.have.protocol('https');
      expect(attachment.getDownloadUrl()).to.be.contain.hostname('taleo.net');
      expect(attachment.getDownloadUrl()).to.be.contain.path(`/object/employee/614/attachment/${attachment.getId()}`);
      done();
    });
  });
});
