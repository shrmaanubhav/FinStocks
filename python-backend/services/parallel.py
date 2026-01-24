import asyncio
import concurrent.futures

from classes import AppState
from services.macro_analysis import macro_economic
from services.news import news_extractor, news_report


def run_parallel_news_and_macro(state: AppState) -> AppState:
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(run_parallel_news_and_macro_async(state))
    else:
        # Fallback to thread pool if we're already inside a running event loop.
        def news_branch(s):
            try:
                return news_report(news_extractor(s, 5))
            except Exception as e:
                print("Error in news branch:", e)
                return s

        def macro_branch(s):
            try:
                return macro_economic(s)
            except Exception as e:
                print("Error in macro branch:", e)
                return s

        with concurrent.futures.ThreadPoolExecutor() as executor:
            f1 = executor.submit(news_branch, state.copy())
            f2 = executor.submit(macro_branch, state.copy())

            news_state = f1.result()
            macro_state = f2.result()

        # Defensive merging
        merged = AppState()
        merged['user_query'] = state.get('user_query', "")
        merged['usage'] = state.get('usage', "")
        merged['stocks'] = state.get('stocks', [])
        merged['portfolio'] = state.get('portfolio', "")

        # Merge news
        merged['news'] = news_state.get('news', "")
        merged['news_dict'] = news_state.get('news_dict', {})
        merged['market_news'] = news_state.get('market_news', "")

        # Merge macro
        merged['macro_economics'] = macro_state.get('macro_economics', "")
        merged['macro_economics_dict'] = macro_state.get('macro_economics_dict', {})

        return merged


async def news_extractor_async(state: AppState, limit = 10) -> AppState:
    return await asyncio.to_thread(news_extractor, state, limit)


async def news_report_async(state: AppState) -> AppState:
    return await asyncio.to_thread(news_report, state)


async def macro_economic_async(state: AppState) -> AppState:
    return await asyncio.to_thread(macro_economic, state)


async def run_parallel_news_and_macro_async(state: AppState) -> AppState:
    async def news_branch(s):
        try:
            s = await news_extractor_async(s, 5)
            return await news_report_async(s)
        except Exception as e:
            print("Error in news branch:", e)
            return s

    async def macro_branch(s):
        try:
            return await macro_economic_async(s)
        except Exception as e:
            print("Error in macro branch:", e)
            return s

    news_state, macro_state = await asyncio.gather(
        news_branch(state.copy()),
        macro_branch(state.copy())
    )

    # Defensive merging
    merged = AppState()
    merged['user_query'] = state.get('user_query', "")
    merged['usage'] = state.get('usage', "")
    merged['stocks'] = state.get('stocks', [])
    merged['portfolio'] = state.get('portfolio', "")

    # Merge news
    merged['news'] = news_state.get('news', "")
    merged['news_dict'] = news_state.get('news_dict', {})
    merged['market_news'] = news_state.get('market_news', "")

    # Merge macro
    merged['macro_economics'] = macro_state.get('macro_economics', "")
    merged['macro_economics_dict'] = macro_state.get('macro_economics_dict', {})

    return merged
