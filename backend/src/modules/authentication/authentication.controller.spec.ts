import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            handleLoginCallback: jest.fn(),
            getProfile: jest.fn(),
            syncProfile: jest.fn(),
            getSession: jest.fn(),
            recordLogout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
