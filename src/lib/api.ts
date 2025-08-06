const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com/api';

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication API
  async login(data: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyToken() {
    try {
      return await this.request<any>('/auth/verify');
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  // Writing Projects API
  async getWritingProjects() {
    return this.request<any[]>('/writing-projects');
  }

  async getWritingProject(id: string) {
    return this.request<any>(`/writing-projects/${id}`);
  }

  async createWritingProject(data: {
    title: string;
    description?: string;
    type: string;
    targetWordCount?: number;
    deadline?: string;
  }) {
    return this.request<any>('/writing-projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWritingProject(id: string, data: {
    title?: string;
    description?: string;
    type?: string;
    status?: 'planning' | 'in_progress' | 'completed';
    currentWordCount?: number;
    targetWordCount?: number;
    deadline?: string;
  }) {
    return this.request<any>(`/writing-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWritingProject(id: string) {
    return this.request<void>(`/writing-projects/${id}`, {
      method: 'DELETE',
    });
  }

  async updateWordCount(id: string, wordCount: number) {
    return this.request<any>(`/writing-projects/${id}/word-count`, {
      method: 'PATCH',
      body: JSON.stringify({ wordCount }),
    });
  }

  // Notebook Content API
  async getNotebookContent(projectId: string) {
    return this.request<{ content: string; theme: string; wordCount: number }>(`/writing-projects/${projectId}/content`);
  }

  async saveNotebookContent(projectId: string, data: {
    content: string;
    wordCount: number;
    theme?: string;
  }) {
    return this.request<any>(`/writing-projects/${projectId}/content`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Journals API
  async getJournals() {
    return this.request<any[]>('/journals');
  }

  async getJournal(id: string) {
    return this.request<any>(`/journals/${id}`);
  }

  async createJournal(data: {
    title: string;
    description?: string;
    cover?: string;
    privacy: 'private' | 'public';
  }) {
    return this.request<any>('/journals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJournal(id: string, data: {
    title?: string;
    description?: string;
    cover?: string;
    privacy?: 'private' | 'public';
  }) {
    return this.request<any>(`/journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJournal(id: string) {
    return this.request<void>(`/journals/${id}`, {
      method: 'DELETE',
    });
  }

  // Journal Content API
  async getJournalContent(journalId: string) {
    return this.request<{ content: string; theme: string; wordCount: number }>(`/journals/${journalId}/content`);
  }

  async saveJournalContent(journalId: string, data: {
    content: string;
    wordCount: number;
    theme?: string;
  }) {
    return this.request<any>(`/journals/${journalId}/content`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Books API
  async getBooks() {
    return this.request<any[]>('/books');
  }

  async getBook(id: string) {
    return this.request<any>(`/books/${id}`);
  }

  async getBooksByStatus(status: string) {
    return this.request<any[]>(`/books/status/${status}`);
  }

  async getBookStats() {
    return this.request<{
      total: number;
      currentlyReading: number;
      finished: number;
      wantToRead: number;
      topGenres: { genre: string; count: number }[];
      averageRating: number;
    }>('/books/stats');
  }

  async createBook(data: {
    title: string;
    author: string;
    genre: string;
    status: 'want_to_read' | 'currently_reading' | 'finished';
    rating?: number;
    notes?: string;
    currentPage?: number;
    totalPages?: number;
  }, file?: File) {
    const formData = new FormData();
    
    // Add JSON data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add file if provided
    if (file) {
      formData.append('pdf', file);
    }

    const url = `${API_BASE_URL}/books`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateBook(id: string, data: {
    title?: string;
    author?: string;
    genre?: string;
    status?: 'want_to_read' | 'currently_reading' | 'finished';
    rating?: number;
    notes?: string;
    currentPage?: number;
    totalPages?: number;
    startDate?: string;
    finishDate?: string;
  }, file?: File) {
    const formData = new FormData();
    
    // Add JSON data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add file if provided
    if (file) {
      formData.append('pdf', file);
    }

    const url = `${API_BASE_URL}/books/${id}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteBook(id: string) {
    return this.request<void>(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadBookFile(id: string): Promise<Blob> {
    const url = `${API_BASE_URL}/books/${id}/download`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  // Tasks API
  async getTasks() {
    return this.request<any[]>('/tasks');
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`);
  }

  async getTasksByStatus(status: 'todo' | 'doing' | 'done') {
    return this.request<any[]>(`/tasks/status/${status}`);
  }

  async getTasksByDate(date: string) {
    return this.request<any[]>(`/tasks/date/${date}`);
  }

  async getTaskStats() {
    return this.request<any>('/tasks/stats');
  }

  async createTask(data: {
    title: string;
    description?: string;
    status: 'todo' | 'doing' | 'done';
    dueDate: string;
  }) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: {
    title?: string;
    description?: string;
    status?: 'todo' | 'doing' | 'done';
    dueDate?: string;
  }) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Notes API
  async getNotes() {
    return this.request<any[]>('/notes');
  }

  async getNote(id: string) {
    return this.request<any>(`/notes/${id}`);
  }

  async getPinnedNotes() {
    return this.request<any[]>('/notes/pinned');
  }

  async searchNotes(query: string) {
    return this.request<any[]>(`/notes/search?q=${encodeURIComponent(query)}`);
  }

  async createNote(data: {
    title: string;
    content: string;
    isPinned?: boolean;
    tags?: string[];
  }) {
    return this.request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: string, data: {
    title?: string;
    content?: string;
    isPinned?: boolean;
    tags?: string[];
  }) {
    return this.request<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: string) {
    return this.request<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Vision Boards API
  async getVisionBoards() {
    return this.request<any[]>('/vision-boards');
  }

  async getVisionBoard(id: string) {
    return this.request<any>(`/vision-boards/${id}`);
  }

  async getVisionBoardByYearAndMonth(year: number, month: number) {
    return this.request<any>(`/vision-boards/year/${year}/month/${month}`);
  }

  async createVisionBoard(data: {
    year: number;
    month: number;
    title?: string;
    description?: string;
  }) {
    return this.request<any>('/vision-boards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVisionBoard(id: string, data: {
    title?: string;
    description?: string;
  }) {
    return this.request<any>(`/vision-boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVisionBoard(id: string) {
    return this.request<void>(`/vision-boards/${id}`, {
      method: 'DELETE',
    });
  }

  async addImageToVisionBoard(boardId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}/vision-boards/${boardId}/images`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateVisionImage(boardId: string, imageId: string, data: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    rotation?: number;
    zIndex?: number;
  }) {
    return this.request<any>(`/vision-boards/${boardId}/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVisionImage(boardId: string, imageId: string) {
    return this.request<void>(`/vision-boards/${boardId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  getVisionImage(imageId: string): string {
    return `${API_BASE_URL}/vision-boards/images/${imageId}`;
  }

  // Quick Notes API
  async getQuickNotes() {
    return this.request<any[]>('/quick-notes');
  }

  async getQuickNote(id: string) {
    return this.request<any>(`/quick-notes/${id}`);
  }

  async createQuickNote(data: {
    content: string;
    color: string;
  }) {
    return this.request<any>('/quick-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuickNote(id: string, data: {
    content?: string;
    color?: string;
  }) {
    return this.request<any>(`/quick-notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuickNote(id: string) {
    return this.request<void>(`/quick-notes/${id}`, {
      method: 'DELETE',
    });
  }

  async getQuickNotesCount() {
    return this.request<{ count: number }>('/quick-notes/count');
  }

  // Reading Goals API
  async getReadingGoals() {
    return this.request<any[]>('/reading-goals');
  }

  async getReadingGoal(id: string) {
    return this.request<any>(`/reading-goals/${id}`);
  }

  async getActiveReadingGoal() {
    return this.request<any>('/reading-goals/active');
  }

  async getReadingGoalByYear(year: number) {
    return this.request<any>(`/reading-goals/year/${year}`);
  }

  async createReadingGoal(data: {
    targetBooks: number;
    targetPages?: number;
    year: number;
  }) {
    return this.request<any>('/reading-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReadingGoal(id: string, data: {
    targetBooks?: number;
    targetPages?: number;
    year?: number;
    isActive?: boolean;
  }) {
    return this.request<any>(`/reading-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReadingGoal(id: string) {
    return this.request<void>(`/reading-goals/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(); 