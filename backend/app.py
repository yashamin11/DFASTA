from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from Bio.Blast import NCBIWWW
from Bio import SeqIO
# Your other code here


app = Flask(__name__)
CORS(app, resources={r"/align_sequences": {"origins": "http://localhost:3005"}})

def smith_waterman(sequence1, sequence2):
    # Define the scoring scheme (match, mismatch, and gap penalties).
    match_score = 2
    mismatch_score = -1
    gap_penalty = -2

    # Create a matrix to store alignment scores.
    rows = len(sequence1) + 1
    cols = len(sequence2) + 1
    score_matrix = [[0] * cols for _ in range(rows)]

    max_score = 0  # Maximum alignment score in the matrix
    max_i, max_j = 0, 0  # Position of the maximum score in the matrix

    # Fill the score matrix.
    for i in range(1, rows):
        for j in range(1, cols):
            match = score_matrix[i - 1][j - 1] + (match_score if sequence1[i - 1] == sequence2[j - 1] else mismatch_score)
            delete = score_matrix[i - 1][j] + gap_penalty
            insert = score_matrix[i][j - 1] + gap_penalty

            score_matrix[i][j] = max(0, match, delete, insert)

            if score_matrix[i][j] > max_score:
                max_score = score_matrix[i][j]
                max_i, max_j = i, j

    # Traceback to find the aligned sequences (not included in this basic example).
    alignment_result = f"Alignment Score: {max_score}\n"
    alignment_result += f"Sequence 1: {sequence1}\n"
    alignment_result += f"Sequence 2: {sequence2}\n"

    return alignment_result

def needleman_wunsch(sequence1, sequence2):
    # Implement the Needleman-Wunsch algorithm
    # This is a basic implementation without traceback

    # Define the scoring scheme (match, mismatch, and gap penalties).
    match_score = 2
    mismatch_score = -1
    gap_penalty = -2


    len_seq1 = len(sequence1)
    len_seq2 = len(sequence2)

    # Create a matrix to store alignment scores.
    score_matrix = np.zeros((len_seq1 + 1, len_seq2 + 1))

    # Initialize the score matrix.
    for i in range(1, len_seq1 + 1):
        score_matrix[i][0] = gap_penalty * i
    for j in range(1, len_seq2 + 1):
        score_matrix[0][j] = gap_penalty * j

    # Fill the score matrix.
    for i in range(1, len_seq1 + 1):
        for j in range(1, len_seq2 + 1):
            match = score_matrix[i - 1][j - 1] + (match_score if sequence1[i - 1] == sequence2[j - 1] else mismatch_score)
            delete = score_matrix[i - 1][j] + gap_penalty
            insert = score_matrix[i][j - 1] + gap_penalty

            score_matrix[i][j] = max(match, delete, insert)

    # Calculate the alignment score.
    alignment_score = score_matrix[len_seq1][len_seq2]

    return alignment_score

def blast_alignment(sequence1, database="nr"):
    # Perform a BLAST alignment using Biopython
    # Your BLAST algorithm implementation here
    # You can adjust parameters as needed
    result_handle = NCBIWWW.qblast("blastn", database, sequence1)
    print(result_handle)
    blast_records = list(SeqIO.parse(result_handle, "blast-xml"))
    result_handle.close()
    print(blast_records)

    # Parse and format the BLAST results
    alignment_result = "BLAST Results:\n"
    for blast_record in blast_records:
        for alignment in blast_record.alignments:
            for hsp in alignment.hsps:
                alignment_result += f"Alignment:\n{alignment.title}\nE-Value: {hsp.expect}\n{hsp.query}\n{hsp.match}\n{hsp.sbjct}\n"

    return alignment_result

@app.route('/align_sequences', methods=['POST'])
def align_sequences():
    data = request.get_json()
    sequence1 = data.get('sequence1', '')
    sequence2 = data.get('sequence2', '')
    selected_algorithm = data.get('selectedAlgorithm', 'smith_waterman')

    if selected_algorithm == 'smith_waterman':
        alignment_result = smith_waterman(sequence1, sequence2)
    elif selected_algorithm == 'needleman_wunsch':
        alignment_result = needleman_wunsch(sequence1, sequence2)
    elif selected_algorithm == 'hmm':
        alignment_result = hmm_alignment(sequence1, sequence2)
    elif selected_algorithm == 'blast':
        alignment_result = blast_alignment(sequence1)

    return jsonify({'alignmentResult': alignment_result})

if __name__ == '__main__':
    app.run(debug=True)


