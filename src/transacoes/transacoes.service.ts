import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { Transacao, TransacaoDocument } from './schemas/transacao.schema';

export interface Metricas {
  saldoTotal: number;
  totalDespesas: number;
  totalGastoImpulso: number;
}

export interface ResumoTransacoes {
  historico: Transacao[];
  metricas: Metricas;
}

@Injectable()
export class TransacoesService {
  constructor(
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<TransacaoDocument>,
  ) {}

  async create(dto: CreateTransacaoDto): Promise<Transacao> {
    return this.transacaoModel.create(dto);
  }

  async findAll(): Promise<ResumoTransacoes> {
    const historico = await this.transacaoModel.find().lean().exec();
    return {
      historico: historico as unknown as Transacao[],
      metricas: this.calcularMetricas(historico as unknown as Transacao[]),
    };
  }

  calcularMetricas(transacoes: Transacao[]): Metricas {
    let totalReceitas = 0;
    let totalDespesas = 0;
    let totalGastoImpulso = 0;

    for (const t of transacoes) {
      if (t.tipo === 'receita') {
        totalReceitas += t.valor;
      } else if (t.tipo === 'despesa') {
        totalDespesas += t.valor;
        if (t.consumoConsciente === false) {
          totalGastoImpulso += t.valor;
        }
      }
    }

    return {
      saldoTotal: totalReceitas - totalDespesas,
      totalDespesas,
      totalGastoImpulso,
    };
  }
}
