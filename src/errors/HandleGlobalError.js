export function handleError(error, res) {
  console.error(error);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}