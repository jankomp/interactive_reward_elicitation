const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

app.get('/runPythonScript', (req, res) => {
    const { inputUrl, selectedOptions, dimensions } = req.query;
    console.log('Received request with inputUrl:', inputUrl);
    console.log('Selected options:', selectedOptions);
    console.log('Dimensions:', dimensions);
    
    const python = spawn('python', ['./dimensional_reduction.py', inputUrl, selectedOptions, dimensions]);
    let result = '';

    python.stdout.on('data', (data) => {
        result += data.toString();
    });

    python.stderr.on('data', (data) => {
        console.error('Error in Python script:', data.toString());
    });

    python.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            return res.status(500).send(`Python script exited with code ${code}`);
        }
        console.log('Python script execution completed successfully');
        console.log('Result:', result);
        
        // Check if there is any result to send back
        if (result.trim().length > 0) {
            try {
                res.send(JSON.parse(result));
            } catch (error) {
                console.error('Error parsing JSON result:', error);
                res.status(500).send('Error parsing JSON result');
            }
        } else {
            console.log('No result to send back');
            res.send('No result to send back');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
