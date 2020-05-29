import { Repository } from 'typeorm';

export class BaseEntityService<T> {
  constructor(protected entityRepository: Repository<T>) {}

  save(...args): Promise<T> {
    return this.entityRepository.save.call(this.entityRepository, ...args);
  }

  delete(...args) {
    return this.entityRepository.delete.call(this.entityRepository, ...args);
  }

  find(...args): Promise<T[]> {
    return this.entityRepository.find.call(this.entityRepository, ...args);
  }

  findOne(...args): Promise<T> {
    return this.entityRepository.findOne.call(this.entityRepository, ...args);
  }
  findByIds(...args): Promise<T[]> {
    return this.entityRepository.findByIds.call(this.entityRepository, ...args);
  }
}
