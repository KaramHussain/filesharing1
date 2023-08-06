import React, { useState } from 'react';
import axios from 'axios';
// import AWS from 'aws-sdk';
import "../awsGlobal"

AWS.config.update({
  accessKeyId: 'AKIAVYZ7WJBZM6WKAW4U',
  secretAccessKey: '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',
  region: 'us-east-1',
}); 

const s3 = new AWS.S3();

const App = () => {
  const [userEmail, setUserEmail] = useState('');
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [file, setFile] = useState(null);
  const [showFileSharing, setShowFileSharing] = useState(false);
  const [fileurl, setFileUrl] = useState('');

  const addEmail = () => {
    if (email.trim() !== '' && validateEmail(email) && emails.length < 5) {
      setEmails((prevEmails) => [...prevEmails, email.trim()]);
      setEmail('');
    }
  };

  const removeEmail = (index) => {
    setEmails((prevEmails) => prevEmails.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmitUserEmail = (e) => {
    e.preventDefault();
    if (!validateEmail(userEmail)) {
      return;
    }
    setShowFileSharing(true);
  };
///////////////////////////////////////////////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || emails.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    
    // formData.append('emailData', JSON.stringify(emailData));

    try {
      const response = await axios.post('http://localhost:3000/upload', formData);
      console.log('File uploaded successfully.');
      console.log('S3 link:', response.data.s3Link);
      setFileUrl(response.data.s3Link);
      const parms = {
        userEmail,
        emails,
        fileurl
      };
      axios.post("https://s3pi92dmng.execute-api.us-east-1.amazonaws.com/sendmail/sendmail",JSON.stringify(parms)).then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    
  };

  return (
    <div>
      {!showFileSharing ? (
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 form-container">
              <h2 className="text-center mb-4">Login</h2>
              <form onSubmit={handleSubmitUserEmail}>
                <div className="form-group">
                  <label htmlFor="userEmailInput">Your Email:</label>
                  <input
                    type="email"
                    className="form-control"
                    id="userEmailInput"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Enter
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="container file-container">
          <h2 className="text-center mb-4">File Sharing Tool</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fileInput">Select File:</label>
              <input
                type="file"
                className="form-control-file"
                id="fileInput"
                required
                onChange={handleFileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="emailInput">Recipient Email Addresses (up to 5):</label>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="emailInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={addEmail}
                  >
                    Add
                  </button>
                </div>
              </div>
              <ul className="list-group" id="emailList">
                {emails.map((email, index) => (
                  <li className="list-group-item" key={index}>
                    {email}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm float-right"
                      onClick={() => removeEmail(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button type="submit" className="btn btn-primary">
              Upload & Share
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
