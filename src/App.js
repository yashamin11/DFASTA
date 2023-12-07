import React, { useEffect } from 'react';

function App() {
  // Replace 'your_genetic_sequence' with your actual genetic sequence
  const geneticSequence = 'your_genetic_sequence';

  useEffect(() => {
    visualizeSequence(geneticSequence);
  }, [geneticSequence]);

  const visualizeSequence = (sequence) => {
    const canvas = document.getElementById('sequenceCanvas');
    const ctx = canvas.getContext('2d');

    // Define colors for each nucleotide
    const colors = { 'A': 'green', 'C': 'blue', 'G': 'orange', 'T': 'red' };

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

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <canvas id="sequenceCanvas" width="800" height="100"></canvas>
    </div>
  );
}

export default App;
