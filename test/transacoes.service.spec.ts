import { Transacao } from '../src/transacoes/schemas/transacao.schema';
import { TransacoesService } from '../src/transacoes/transacoes.service';

describe('TransacoesService.calcularMetricas', () => {
  // O cálculo é puro: não depende do model, então basta um mock vazio.
  const service = new TransacoesService({} as any);

  const t = (
    tipo: 'receita' | 'despesa',
    valor: number,
    consumoConsciente = true,
  ): Transacao => ({
    descricao: 'x',
    categoria: 'y',
    tipo,
    valor,
    consumoConsciente,
  });

  it('retorna zeros quando não há transações', () => {
    expect(service.calcularMetricas([])).toEqual({
      saldoTotal: 0,
      totalDespesas: 0,
      totalGastoImpulso: 0,
    });
  });

  it('calcula saldo, total de despesas e gasto por impulso', () => {
    const resultado = service.calcularMetricas([
      t('receita', 3000),
      t('despesa', 800, true), // essencial
      t('despesa', 200, false), // impulso
      t('despesa', 100, false), // impulso
    ]);

    expect(resultado).toEqual({
      saldoTotal: 1900,
      totalDespesas: 1100,
      totalGastoImpulso: 300,
    });
  });

  it('ignora consumoConsciente=false em receitas no gasto por impulso', () => {
    const resultado = service.calcularMetricas([
      t('receita', 500, false),
      t('despesa', 50, false),
    ]);
    expect(resultado.totalGastoImpulso).toBe(50);
    expect(resultado.saldoTotal).toBe(450);
  });
});
