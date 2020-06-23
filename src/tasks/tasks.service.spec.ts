import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { getTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 12, username: "Zeeshan" };

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn()
});

describe('TasksService', () => {
    let tasksService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useFactory: mockTaskRepository }
            ],
        }).compile();

        tasksService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('get all the tasks from repository', async () => {
            taskRepository.getTasks.mockResolvedValue('someValue');

            expect(taskRepository.getTasks).not.toHaveBeenCalled();
            const filters: getTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'Some query' };
            // call tasksService.getTasks
            const result = await tasksService.getTasks(filters, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        })
    })

    describe('getTaskById', () => {
        it('calls taskRepository.findOne and successfully retrieve and return the task', async () => {
            const mockTask = { title: "Task Title", description: "Task Desc" };
            taskRepository.findOne.mockResolvedValue(mockTask)

            const result = await tasksService.getTaskById(1, mockUser)
            expect(result).toEqual(mockTask)

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: mockUser.id
                }
            })
        })

        it('throws an error as task is not found', () => {
            taskRepository.findOne.mockResolvedValue(null)
            expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException)            
        })
    })

    describe('createTask', () => {
        it('creates taskRepository.createTask and returns the result', async () => {
            taskRepository.createTask.mockResolvedValue('tasks');

            expect(taskRepository.createTask).not.toHaveBeenCalled();
            const createTaskDto = { title: "Test task", description: "Test desc" };
            const result = await tasksService.createTask(createTaskDto, mockUser);
            expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual('tasks');    
        })
    })
});