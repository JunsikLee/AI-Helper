import './MutilView.css';

function MutilView() {
    return (
        <>
            <div className='layout'>
                <div>
                    <webview src="https://www.perplexity.ai/" className="view"></webview>
                </div>
                <div>
                    <webview src="https://chatgpt.com/" className="view"></webview>
                </div>
            </div>
        </>
    );
}
export default MutilView;
