const loadCustomPuzzle = () => {
  setError('')
  setLoading(true)

  const str = prompt(
    'Enter Full PGN from LiChess - Remember to set it to the starting position!',
  )
  if (!str) return

  const isDirectStart = prompt('Is the first move the player to move? (y/n)')
  if (!isDirectStart) return

  const lines = str
    .replaceAll(/\{.*?\}/g, '') // Remove comments
    .replaceAll(/[\*\?!]/g, '') // Remove move annotations
    .split('\n')
    .map((line) => line.replaceAll('\r', '').trim())
    .filter((line) => line.length > 0)
  const fenLine = lines.find((line) => line.startsWith('[FEN'))
  if (!fenLine) {
    setError('Invalid FEN')
    return
  }

  const fen = fenLine.split('"')[1]
  if (!fen) {
    setError('Invalid FEN')
    return
  }

  // Find the first line that doesn't start with a [ This will be the moves
  // Then split this by spaces, and remove the move numbers
  const moves = lines
    .find((line) => !line.startsWith('[') && !line.startsWith('{'))
    ?.split(' ')
    .filter((move) => !move.includes('.'))

  if (!moves) {
    setError('Invalid Moves')
    return
  }

  const rating = parseInt(prompt('Enter the rating of the puzzle', '1500')!)
  if (!rating) return

  const newPuzzle = {
    fen,
    rating,
    ratingdeviation: 0,
    themes: [],
    puzzleid: 'cta_' + uuidv4().split('-')[4],
    moves,
    directStart: isDirectStart.toLowerCase() == 'y',
    curatedPuzzleId: 0,
  }

  props.setPuzzle(newPuzzle)
}
