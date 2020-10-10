/*
 * Interfaces/types for a "Data Source" for saved places 
 */
export interface IDataSource {     
    readonly status: DataSourceStatus;
    readonly error?: IDataSourceError;
    readonly isInitialized: boolean;
    initialize(callback?: DataSourceInitCallback ): void;
    getData(): any;
    getSummary(): any;
    getDump(): any;
}

export type DataSourceInitCallback = (isInitialized: boolean) => void

export interface IDataSourceError {
    readonly errorMsg: string;
    readonly errorDetail?: any;
}

export enum DataSourceStatus {
    Uninitialized,
    InitializeInProgress,
    Initialized,
    Errored,
}