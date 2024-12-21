import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'calendar' })
export class CalendarEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

}
