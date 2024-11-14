import './SingleView.css';

function SingleView() {
    return (
        <>
            <div className="layout">
                <webview src="https://chatgpt.com/" className="view"></webview>
            </div>
        </>
    );
}

export default SingleView;
