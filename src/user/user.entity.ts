import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../auth/roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.CANDIDAT })
  role: Role; // Ajout du rôle
}
