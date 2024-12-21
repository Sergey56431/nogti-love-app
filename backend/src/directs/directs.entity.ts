import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'directs' })
export class Directs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  avatar: string;

  @Column()
  client: string;

  @Column()
  phone: string;

  @Column()
  adminComment: string;

  @Column()
  timeDirect: string;

}
