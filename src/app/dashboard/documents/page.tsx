'use client'

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { documentAPI, DocumentInfo } from "@/lib/api";
import { businessAPI, Business } from "@/lib/business-api";
import config from "@/lib/config"
import {
    Upload,
    FileText,
    File,
    X,
    CheckCircle,
    AlertCircle,
    Download,
    Eye,
    Search,
    Trash2,
    Share,
    Calendar,
    FileIcon,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'success' | 'error' | 'processing';
    progress: number;
    url?: string;
    uploadedAt?: Date;
    category?: string;
    taskId?: string;
    documentId?: string;
    errorMessage?: string;
}

// Processing status mapping
const getProcessingStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return { status: 'active', label: 'Active', color: 'text-green-400' };
        case 'processing':
        case 'queued':
            return { status: 'processing', label: 'Processing', color: 'text-yellow-400' };
        case 'failed':
        case 'error':
            return { status: 'error', label: 'Error', color: 'text-red-400' };
        default:
            return { status: 'processing', label: 'Processing', color: 'text-yellow-400' };
    }
};

// Get category from document metadata
// Get category from document metadata (safe, returns a string)
const getDocumentCategory = (doc: DocumentInfo): string => {
    // 1) prefer meta.category when it's a non-empty string
    const metaCategory = doc.meta?.category;
    if (typeof metaCategory === 'string' && metaCategory.trim().length > 0) {
        return metaCategory;
    }

    // 2) fallback to file_type (ensure it's a string before calling toUpperCase)
    if (typeof doc.file_type === 'string' && doc.file_type.trim().length > 0) {
        return doc.file_type.toUpperCase();
    }

    // 3) fallback to mime_type subtype, e.g. "application/pdf" -> "PDF"
    if (typeof doc.mime_type === 'string' && doc.mime_type.includes('/')) {
        const subtype = doc.mime_type.split('/')[1];
        if (subtype && subtype.trim().length > 0) {
            return subtype.toUpperCase();
        }
    }

    // 4) final default
    return 'Document';
};


const DocumentsPage = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const acceptedFileTypes = config.upload.acceptedFileTypes;
    const maxFileSize = config.upload.maxFileSize;

    // loadDocuments memoized so other callbacks can depend on it
    const loadDocuments = useCallback(async (businessId: string) => {
        try {
            const response = await documentAPI.listDocuments(businessId, 100, 0);
            setDocuments(response.documents);
            setTotalDocuments(response.total);
        } catch (err) {
            console.error('Error loading documents:', err);
            throw err;
        }
    }, []);

    // Load business and documents on component mount (memoized)
    const loadBusinessAndDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get current business
            const business = await businessAPI.getPrimaryBusiness();
            if (!business) {
                setError('No business found. Please create a business first.');
                return;
            }

            setCurrentBusiness(business);

            // Load documents for this business
            await loadDocuments(business.id);

        } catch (err) {
            console.error('Error loading business and documents:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    }, [loadDocuments]);

    useEffect(() => {
        loadBusinessAndDocuments();
    }, [loadBusinessAndDocuments]);

    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const validateFile = useCallback((file: File) => {
        if (file.size > maxFileSize) {
            toast.error(
                `File too large. Maximum size is ${formatFileSize(maxFileSize)}`
            );
            return false;
        }

        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedFileTypes.includes(fileExtension)) {
            toast.error(
                `Invalid file type. Supported types: ${acceptedFileTypes.join(', ')}`
            );
            return false;
        }

        return true;
    }, [acceptedFileTypes, maxFileSize, formatFileSize]);

    const pollTaskStatus = useCallback(async (taskId: string, fileId: string) => {
        try {
            const statusResponse = await documentAPI.getTaskStatus(taskId);

            if (statusResponse.status === 'completed') {
                setFiles(prev => prev.map(f =>
                    f.id === fileId ? { ...f, status: 'success' } : f
                ));
                toast.success('Document processing completed');

                // Refresh documents list when processing completes
                if (currentBusiness) {
                    loadDocuments(currentBusiness.id);
                }
            } else if (statusResponse.status === 'failed') {
                setFiles(prev => prev.map(f =>
                    f.id === fileId ? {
                        ...f,
                        status: 'error',
                        errorMessage: statusResponse.message || 'Processing failed'
                    } : f
                ));
                toast.error('Document processing failed');
            } else {
                // Still processing, poll again after configured interval
                setTimeout(() => pollTaskStatus(taskId, fileId), config.polling.interval);
            }
        } catch (err) {
            console.error('Error polling task status:', err);
            // Continue polling in case of temporary network issues with backoff
            setTimeout(() => pollTaskStatus(taskId, fileId), config.polling.interval * config.polling.backoffMultiplier);
        }
    }, [currentBusiness, loadDocuments]);

    const uploadFile = useCallback(async (file: File, fileId: string) => {
        if (!currentBusiness) {
            toast.error('No business selected');
            return;
        }

        try {
            const response = await documentAPI.uploadDocument(
                file,
                currentBusiness.id,
                (progress) => {
                    setFiles(prev => prev.map(f =>
                        f.id === fileId ? { ...f, progress } : f
                    ));
                }
            );

            // Update file with upload response
            setFiles(prev => prev.map(f =>
                f.id === fileId ? {
                    ...f,
                    status: 'processing',
                    progress: 100,
                    taskId: response.task_id,
                    documentId: response.document_id,
                    uploadedAt: new Date()
                } : f
            ));

            toast.success(`Upload successful: ${response.filename}`);

            // Start polling for processing status
            pollTaskStatus(response.task_id, fileId);

            // Refresh documents list after successful upload
            if (currentBusiness) {
                setTimeout(() => loadDocuments(currentBusiness.id), 1000);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setFiles(prev => prev.map(f =>
                f.id === fileId ? {
                    ...f,
                    status: 'error',
                    errorMessage
                } : f
            ));
            toast.error(`Upload failed: ${errorMessage}`);
        }
    }, [currentBusiness, pollTaskStatus, loadDocuments]);

    const handleFiles = useCallback(async (fileList: FileList) => {
        if (isUploading) {
            toast.error('Please wait for current uploads to complete');
            return;
        }

        const validFiles: { file: File; fileId: string }[] = [];
        const newFiles: UploadedFile[] = [];

        Array.from(fileList).forEach(file => {
            if (validateFile(file)) {
                const fileId = Math.random().toString(36).substring(7);
                validFiles.push({ file, fileId });
                newFiles.push({
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    status: 'uploading',
                    progress: 0
                });
            }
        });

        if (newFiles.length > 0) {
            setFiles(prev => [...prev, ...newFiles]);
            setIsUploading(true);

            // Upload files sequentially to avoid overwhelming the server
            for (const { file, fileId } of validFiles) {

                await uploadFile(file, fileId);
            }

            setIsUploading(false);
        }
    }, [isUploading, validateFile, uploadFile]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    const getFileIcon = useCallback((type: string, size: "sm" | "lg" = "sm") => {
        const sizeClass = size === "lg" ? "h-8 w-8" : "h-5 w-5";
        if (!type) return <FileIcon className={`${sizeClass} text-gray-400`} />;
        if (type.includes('pdf')) return <FileText className={`${sizeClass} text-red-400`} />;
        if (type.includes('word') || type.includes('doc')) return <FileText className={`${sizeClass} text-blue-400`} />;
        if (type.includes('excel') || type.includes('sheet')) return <FileText className={`${sizeClass} text-green-400`} />;
        return <FileIcon className={`${sizeClass} text-gray-400`} />;
    }, []);

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
        const category = getDocumentCategory(doc);
        const matchesCategory = selectedCategory === "all" || category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", ...Array.from(new Set(documents.map(doc => getDocumentCategory(doc))))];

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading documents...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={loadBusinessAndDocuments} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Document Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Upload and manage training documents for {currentBusiness?.name || 'your business'}
                    </p>
                </div>
                <div>
                    <Button
                        className="gap-2 bg-white text-black hover:bg-gray-100"
                        onClick={() => document.getElementById('header-file-input')?.click()}
                        disabled={isUploading}
                    >
                        <Plus className="h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                    <input
                        id="header-file-input"
                        type="file"
                        multiple
                        accept={acceptedFileTypes.join(',')}
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">
                            Total Documents
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">{totalDocuments}</div>
                        <p className="text-xs text-muted-foreground">
                            Active knowledge base files
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">
                            Storage Used
                        </CardTitle>
                        <Upload className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">
                            {formatFileSize(documents.reduce((acc, doc) => acc + doc.size_bytes, 0))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Of 1GB available
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">
                            Processing
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">
                            {documents.filter(doc => getProcessingStatusDisplay(doc.processing_status).status === 'processing').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Documents being indexed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background border-border"
                    />
                </div>
                <div className="flex gap-2">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="capitalize"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Documents Table */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-card-foreground">Document Library</CardTitle>
                    <CardDescription>
                        Manage your uploaded documents and training materials
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-muted/50">
                                <TableHead className="text-muted-foreground">Name</TableHead>
                                <TableHead className="text-muted-foreground">Category</TableHead>
                                <TableHead className="text-muted-foreground">Size</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-muted-foreground">Uploaded</TableHead>
                                <TableHead className="text-muted-foreground">Downloads</TableHead>
                                <TableHead className="text-muted-foreground w-[50px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDocuments.map((doc) => {
                                const statusDisplay = getProcessingStatusDisplay(doc.processing_status);
                                const category = getDocumentCategory(doc);
                                return (
                                    <TableRow key={doc.id} className="border-border hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(doc.mime_type)}
                                                <span className="text-foreground">{doc.original_filename}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatFileSize(doc.size_bytes)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {statusDisplay.status === 'success' && (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                                        <span className="text-green-400 text-sm">{statusDisplay.label}</span>
                                                    </>
                                                )}
                                                {statusDisplay.status === 'processing' && (
                                                    <>
                                                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                                                        <span className="text-yellow-400 text-sm">{statusDisplay.label}</span>
                                                    </>
                                                )}
                                                {statusDisplay.status === 'error' && (
                                                    <>
                                                        <X className="h-4 w-4 text-red-400" />
                                                        <span className="text-red-400 text-sm">{statusDisplay.label}</span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            0
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Share className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Upload Progress Section */}
            {files.length > 0 && (
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-card-foreground">Recent Uploads</CardTitle>
                        <CardDescription>
                            Track the progress of your document uploads
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border"
                                >
                                    <div className="flex-shrink-0">
                                        {getFileIcon(file.type, "lg")}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {file.name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {file.status === 'success' && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-400 hover:text-red-300"
                                                    onClick={() => removeFile(file.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-2 gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {formatFileSize(file.size)}
                                            </span>

                                            {file.status === 'uploading' && (
                                                <div className="flex-1 max-w-[200px]">
                                                    <Progress value={file.progress} className="h-2" />
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {Math.round(file.progress)}% uploaded
                                                    </span>
                                                </div>
                                            )}

                                            {file.status === 'success' && (
                                                <div className="flex items-center text-green-400">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    <span className="text-xs">Successfully processed</span>
                                                </div>
                                            )}

                                            {file.status === 'processing' && (
                                                <div className="flex items-center text-blue-400">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    <span className="text-xs">Processing document...</span>
                                                </div>
                                            )}

                                            {file.status === 'error' && (
                                                <div className="flex items-center text-red-400">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    <span className="text-xs" title={file.errorMessage}>
                                                        {file.errorMessage || 'Upload failed'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Upload Area */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-card-foreground">Quick Upload</CardTitle>
                    <CardDescription>
                        Drag and drop files or click to browse
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={cn(
                            "rounded-lg border-2 border-dashed transition-all duration-200",
                            dragActive
                                ? "border-white bg-white/5 scale-[1.02]"
                                : "border-border hover:border-white/50",
                            "p-8 text-center cursor-pointer"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('quick-upload-file-input')?.click()}
                    >
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white" />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Drop files here or click to browse
                                </h3>
                                <p className="text-muted-foreground mt-1">
                                    Supports PDF, DOC, TXT, CSV, and Excel files up to 10MB
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {acceptedFileTypes.map(type => (
                                    <Badge key={type} variant="outline" className="text-xs">
                                        {type.toUpperCase()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <input
                        id="quick-upload-file-input"
                        type="file"
                        multiple
                        accept={acceptedFileTypes.join(',')}
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        className="hidden"
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentsPage;
