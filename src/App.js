import React, {
  Component,
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useState,
  memo,
  useCallback,
} from 'react';
import './App.css';
import styled from 'styled-components'
import { createBrowserHistory } from 'history';

const AppContext = createContext();

const reducer = (state = {}, action) => {
  // console.log(action); 

  switch (action.type) {
    case 'CHANGE_CONTENT':
      return {
        ...state,
        ...{ content: action.value }
      };

    case 'CHANGE_LETTERS':
      return {
        ...state,
        ...{ letters: action.value }
      };

    case 'CHANGE_SYMBOL':
      return {
        ...state,
        ...{ symbol: action.value }
      };

    default:
      return state;
  }
}

const effector = (action = {}, state, registry) => {
  switch (action.type) {
    case 'DEBUG':
      console.log('DEBUG: ', action, { state });
      break;

    case 'CHANGE_LOCATION':
      registry.history.push(action.location);
      break;
      
    default:
  }
};

const selectors = {
  getFilteredContent(state) {
    const letters = state.letters;
    const symbol = state.symbol;
    const content = state.content;
  
    return useMemo(() => {
      const letterList = letters.split('');
      return content
        .split('')
        .map(letter => letterList.includes(letter) ? symbol : letter)
        .join('');
    }, [letters, symbol, content]);
  },
}

const AppProvider = ({ children }) => {
  const initialState = {
    letters: 'a',
    content: '',
    symbol: '🍕',
  }
  
  const [lastAction, setLastAction] = useState();
  const [state, _dispatch] = useReducer(reducer, initialState);
  const [dispatch, setDispatch] = useState(() => {});
  const [registry, setRegistry] = useState();
  
  // Set up dispatch like this to keep its identity consistent.
  useEffect(() => {
    const dispatch = action => {
      setLastAction(action);
      _dispatch(action);
    };

    // Use function notation to prevent the setter from invoking the function.
    setDispatch(() => dispatch);
    setRegistry(registry => ({ ...registry, dispatch }));
  }, []);

  useEffect(() => {
    const history = createBrowserHistory();
    const unlisten = history.listen((location, action) => {
      dispatch({ type: 'RESOLVE_LOCATION', location });
    });
    setRegistry(registry => ({ ...registry, history }));
    return unlisten;
  }, [dispatch]);

  useEffect(() => {
    effector(lastAction, state, registry);
  }, [lastAction, state, registry]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line no-unused-vars
const Debugger = ({ silent = false, children }) => {
  if (!silent) console.log('rendered');
  return <>{children}</>;
}

const Container = styled.section`
  display: flex
`;

const Panel = styled.div`
  flex: 1;
`;

const ContentForm = memo(function ContentForm({ content, dispatch }) {  
  return (
    <form>
      <label>
        <div>content:</div>
        <div>
          <textarea value={content} onChange={event => dispatch({ type: 'CHANGE_CONTENT', value: event.target.value })} />
        </div>
      </label>
    </form>
  );
})

const ContentFormEdge = () => {
  const { state, dispatch } = useContext(AppContext);

  return <ContentForm content={state.content} dispatch={dispatch} />
}

const Preview = memo(function Preview ({ content }) {
  return (
    <div>
      {content}
    </div>
  );
});

const PreviewEdge = () => {
  const { state } = useContext(AppContext);
  const content = selectors.getFilteredContent(state);

  return <Preview content={content} />
}

const Link = ({ children, href, ...rest }) => {
  const { dispatch } = useContext(AppContext);
  
  const handleClick = useCallback(event => {
    event.preventDefault();
    dispatch({ type: 'CHANGE_LOCATION', location: href });
  }, [href, dispatch]);

  return (
    <a href={href} onClick={handleClick} {...rest}>{children}</a>
  );
}

const ConfigForm = memo(function ConfigForm({ letters, symbol, dispatch }) {
  return (
    <>
      <form>
        <label>
          <div>
            letters
          </div>
          <input value={letters} onChange={event => dispatch({ type: 'CHANGE_LETTERS', value: event.target.value })} />
        </label>
        <label>
          <div>
            symbol
          </div>
          <input value={symbol} onChange={event => dispatch({ type: 'CHANGE_SYMBOL', value: event.target.value })} />
        </label>
      </form>
      <button onClick={() => dispatch({ type: 'DEBUG', payload: 'testing, testing' })}>debug</button>
      <div>
        <Link href="/test">test</Link> | <Link href="/">home</Link>
      </div>
    </>
  );
});

const ConfigFormEdge = () => {
  const { state, dispatch } = useContext(AppContext);
  const { letters, symbol } = state;

  return <ConfigForm letters={letters} symbol={symbol} dispatch={dispatch} />
}

class App extends Component {
  render() {
    return (
      <AppProvider>
        <Container>
          <Panel>
            <ContentFormEdge />
            <ConfigFormEdge />
          </Panel>
          <Panel>
            <PreviewEdge />
          </Panel>
        </Container>
      </AppProvider>
    );
  }
}

export default App;
