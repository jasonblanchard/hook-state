import React, {
  Component,
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useState
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

const AppProvider = ({ children }) => {
  const initialState = {
    letters: 'a',
    content: '',
    symbol: '🍕'
  }
  
  const [lastAction, setLastAction] = useState();

  const [state, _dispatch] = useReducer(reducer, initialState);
  const dispatch = action => {
    setLastAction(action);
    _dispatch(action);
  }

  const [registry, setRegistry] = useState({ dispatch });

  useEffect(() => {
    const history = createBrowserHistory();
    const unlisten = history.listen((location, action) => {
      registry.dispatch({ type: 'RESOLVE_LOCATION', location });
    });
    setRegistry(registry => ({ ...registry, history }));
    return unlisten;
  }, []);

  useEffect(() => {
    effector(lastAction, state, registry);
  }, [lastAction, state, registry]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

const Container = styled.section`
  display: flex
`;

const Panel = styled.div`
  flex: 1;
`;

const ContentForm = () => {
  const { state, dispatch } = useContext(AppContext);

  return (
    <form>
      <label>
        <div>content:</div>
        <div>
          <textarea value={state.content} onChange={event => dispatch({ type: 'CHANGE_CONTENT', value: event.target.value })} />
        </div>
      </label>
    </form>
  );
}

function getFilteredContent(state) {
  const letters = state.letters;
  const symbol = state.symbol;
  const content = state.content;

  return useMemo(() => {
    const letterList = letters.split('');
    return content
      .split('')
      .map(letter => letterList.includes(letter) ? symbol : letter);
  }, [letters, symbol, content]);
}

const Preview = () => {
  const { state } = useContext(AppContext);
  const content = getFilteredContent(state);

  return (
    <div>
      {content}
    </div>
  );
}

const Link = ({ children, href, ...rest }) => {
  const { dispatch } = useContext(AppContext);
  
  const handleClick = event => {
    event.preventDefault();
    dispatch({ type: 'CHANGE_LOCATION', location: href });
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>{children}</a>
  );
}

const ConfigForm = () => {
  const { state, dispatch } = useContext(AppContext);

  return (
    <>
      <form>
        <label>
          <div>
            letters
          </div>
          <input value={state.letters} onChange={event => dispatch({ type: 'CHANGE_LETTERS', value: event.target.value })} />
        </label>
        <label>
          <div>
            symbol
          </div>
          <input value={state.symbol} onChange={event => dispatch({ type: 'CHANGE_SYMBOL', value: event.target.value })} />
        </label>
      </form>
      <button onClick={() => dispatch({ type: 'DEBUG', payload: 'testing, testing' })}>debug</button>
      <div>
        <Link href="/test">test</Link> | <Link href="/">home</Link>
      </div>
    </>
  );
}

class App extends Component {
  render() {
    return (
      <AppProvider>
        <Container>
          <Panel>
            <ContentForm />
            <ConfigForm />
          </Panel>
          <Panel>
            <Preview />
          </Panel>
        </Container>
      </AppProvider>
    );
  }
}

export default App;
