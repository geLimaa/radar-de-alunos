import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

/**
 * Variáveis de ambiente da API. Os valores atribuídos aqui são os defaults
 * usados quando a variável não existe no ambiente nem no arquivo `.env`.
 */
export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DATA_DIR: string = '../data/processed';

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string = 'http://localhost:5173';
}

/**
 * Usada pelo ConfigModule na subida: converte e valida as variáveis.
 * Se alguma for inválida, a API não sobe e mostra o motivo.
 */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env);

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new Error(
      `Variáveis de ambiente inválidas (confira o .env):\n- ${messages.join('\n- ')}`,
    );
  }

  return env;
}
