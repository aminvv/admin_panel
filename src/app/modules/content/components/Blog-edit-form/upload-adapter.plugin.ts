import { MyUploadAdapter } from './upload-adapter';

export function MyCustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {

    const cloudinaryService = editor.config.get('cloudinaryService');
    return new MyUploadAdapter(loader, cloudinaryService);
  };
}
