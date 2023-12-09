import React, { useState, useEffect } from 'react';

function App() {
    const [geneticSequence1, setGeneticSequence1] = useState('');
    const [geneticSequence2, setGeneticSequence2] = useState('');

    useEffect(() => {
        visualizeSequence(geneticSequence1, document.getElementById('sequenceCanvas1'));
    }, [geneticSequence1]);

    useEffect(() => {
        visualizeSequence(geneticSequence2, document.getElementById('sequenceCanvas2'));
    }, [geneticSequence2]);

    const visualizeSequence1 = (sequence) => {
        const canvas = document.getElementById('sequenceCanvas1');
        const ctx = canvas.getContext('2d');

        // Define colors for each nucleotide
        const colors = { 'a': 'green', 'c': 'blue', 'g': 'orange', 't': 'red' };

        // Set the width and height of each nucleotide in pixels
        const nucleotideWidth = 10;
        const nucleotideHeight = canvas.height;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Loop through the sequence and draw each nucleotide
        for (let i = 0; i < sequence.length; i++) {
            const nucleotide = sequence[i];
            const color = colors[nucleotide] || 'black';

            ctx.fillStyle = color;
            ctx.fillRect(i * nucleotideWidth, 0, nucleotideWidth, nucleotideHeight);
        }
    };

    const visualizeSequence = (sequence, canvas) => {
        const ctx = canvas.getContext('2d');
        const colors = { 'a': 'green', 'c': 'blue', 'g': 'orange', 't': 'red', '-': 'yellow' };
        const nucleotideWidth = 10;
        const nucleotideHeight = canvas.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < sequence.length; i++) {
            const nucleotide = sequence[i];
            const color = colors[nucleotide] || 'black';

            ctx.fillStyle = color;
            ctx.fillRect(i * nucleotideWidth, 0, nucleotideWidth, nucleotideHeight);
        }
    }

    const visualizeAlignment = (alignment1, alignment2, maxI, maxJ, len) => {
        const c1 = document.getElementById('alignCanvas1');
        const c2 = document.getElementById('alignCanvas2');
        const ctx1 = c1.getContext('2d');
        const ctx2 = c2.getContext('2d');
        // Define colors for each nucleotide
        const colors = { 'a': 'green', 'c': 'blue', 'g': 'orange', 't': 'red', '-': 'yellow' };

        // Set the width and height of each nucleotide in pixels
        const nucleotideWidth = 10;
        const nucleotideHeight = c1.height;

        // Clear the canvas
        ctx1.clearRect(0, 0, c1.width, c1.height);
        ctx2.clearRect(0, 0, c1.width, c1.height);
        

        const mAlignment1 = alignment1.replace(/-/g, '');
        const mAlignment2 = alignment2.replace(/-/g, '');
        console.log(mAlignment1, mAlignment2)

        // Loop through the sequence and draw each nucleotide
        const startIdx1 = maxI - mAlignment1.length;
        let j = 0;
        for (let i = 0; i < geneticSequence1.length; i++) {
            let color = 'black';
            let nucleotide = geneticSequence1[i];
            if(i >= startIdx1 && i < maxI)
            {
                nucleotide = mAlignment1[j];
                j++;
                color = colors[nucleotide] || 'black';
            }
            ctx1.fillStyle = color;
            ctx1.fillRect(i * nucleotideWidth, 0, nucleotideWidth, nucleotideHeight);
        }

        const startIdx2 = maxJ - mAlignment2.length;
        j = 0;
        for (let i = 0; i < geneticSequence2.length; i++) {
            let color = 'black';
            let nucleotide = geneticSequence2[i];
            if(i >= startIdx2 && i < maxJ)
            {
                nucleotide = mAlignment2[j];
                j++;
                color = colors[nucleotide] || 'black';
            }
            ctx2.fillStyle = color;
            ctx2.fillRect(i * nucleotideWidth, 0, nucleotideWidth, nucleotideHeight);
        }
    } 

    const handleFileUpload1 = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                setGeneticSequence1(content);
            };
            reader.readAsText(file);
        }
    };

    const handleFileUpload2 = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                setGeneticSequence2(content);
            };
            reader.readAsText(file);
        }
    };

    const smithWaterman = (seq1, seq2) => {
        const gapPenalty = -1;
        const scoringMatrix = {
            'a': { 'a': 2, 'c': -1, 'g': -1, 't': -1 },
            'c': { 'a': -1, 'c': 2, 'g': -1, 't': -1 },
            'g': { 'a': -1, 'c': -1, 'g': 2, 't': -1 },
            't': { 'a': -1, 'c': -1, 'g': -1, 't': 2 },
        };

        const numRows = seq1.length + 1;
        const numCols = seq2.length + 1;

        const matrix = Array.from({ length: numRows }, () => Array(numCols).fill(0));

        for (let i = 1; i < numRows; i++) {
            for (let j = 1; j < numCols; j++) {
                const match = matrix[i - 1][j - 1] + scoringMatrix[seq1[i - 1]][seq2[j - 1]];
                const deletePenalty = matrix[i - 1][j] + gapPenalty;
                const insertPenalty = matrix[i][j - 1] + gapPenalty;

                matrix[i][j] = Math.max(0, match, deletePenalty, insertPenalty);
            }
        }

        // Find the maximum score in the matrix
        let maxScore = 0;
        let maxI = 0;
        let maxJ = 0;

        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                if (matrix[i][j] > maxScore) {
                    maxScore = matrix[i][j];
                    maxI = i;
                    maxJ = j;
                }
            }
        }

        // Traceback to generate alignments
        let i = maxI;
        let j = maxJ;
        let alignment1 = '';
        let alignment2 = '';

        while (i > 0 && j > 0 && matrix[i][j] > 0) {
            const currentScore = matrix[i][j];
            const diagonalScore = matrix[i - 1][j - 1];
            const upScore = matrix[i - 1][j];
            const leftScore = matrix[i][j - 1];

            if (currentScore === diagonalScore + scoringMatrix[seq1[i - 1]][seq2[j - 1]]) {
                alignment1 = seq1[i - 1] + alignment1;
                alignment2 = seq2[j - 1] + alignment2;
                i--;
                j--;
            } else if (currentScore === upScore + gapPenalty) {
                alignment1 = seq1[i - 1] + alignment1;
                alignment2 = '-' + alignment2;
                i--;
            } else {
                alignment1 = '-' + alignment1;
                alignment2 = seq2[j - 1] + alignment2;
                j--;
            }
        }
        const len = alignment1.length
        visualizeAlignment(alignment1, alignment2, maxI, maxJ, len)
        visualizeSequence(alignment1, document.getElementById('smallCanvas1'));
        visualizeSequence(alignment2, document.getElementById('smallCanvas2'));
        return { score: maxScore, alignment1, alignment2, maxI, maxJ, len};
    };

    const handleAlignment = (event) => {
        console.log("Handling Alignment")
        if (geneticSequence1 == '' || geneticSequence2 == '') {
            console.log("Both sequences not present")
        }
        else {
            console.log("Both sequences present")
            console.log(smithWaterman(geneticSequence1, geneticSequence2))
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>FASTA Viewer</h1>

            <input type="file" accept=".fasta" onChange={handleFileUpload1} style={{ marginBottom: '10px', marginTop: '20px' }} />
            <canvas id="sequenceCanvas1" width="1000" height="50" ></canvas>
            <canvas id="alignCanvas1" width="1000" height="50" style={{ marginBottom: '5px', marginTop: '5px' }} ></canvas>

            <input type="file" accept=".fasta" onChange={handleFileUpload2} style={{ marginBottom: '10px', marginTop: '20px' }} />
            <canvas id="sequenceCanvas2" width="1000" height="50"></canvas>
            <canvas id="alignCanvas2" width="1000" height="50" style={{ marginBottom: '5px', marginTop: '5px' }}></canvas>

            <input type='button' value={'Check Alignment'} onClick={handleAlignment} style={{ marginBottom: '10px', marginTop: '20px' }}></input>
            
            <h2>Aligned Sequences</h2>
            <canvas id="smallCanvas1" width="1000" height="50" style={{ marginBottom: '5px', marginTop: '5px' }} ></canvas>
            <canvas id="smallCanvas2" width="1000" height="50" style={{ marginBottom: '5px', marginTop: '5px' }}></canvas>

            
            

        </div>
    );
}

export default App;
